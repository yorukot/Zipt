package domain

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"slices"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/logger"
	"github.com/yorukot/zipt/pkg/utils"
)

// ExpectedCNAMETarget is the domain that users should point their CNAME records to
var ExpectedCNAMETarget string

func init() {
	ExpectedCNAMETarget = os.Getenv("LINKS_DOMAIN")
	if ExpectedCNAMETarget == "" {
		ExpectedCNAMETarget = "app.zipt.io" // Default value if environment variable is not set
	}
}

// VerifyDomain is an endpoint to verify domain ownership by DNS TXT record
func VerifyDomain(c *gin.Context) {
	fmt.Println("ExpectedCNAMETarget", ExpectedCNAMETarget)
	// Get domain ID from parameters
	domainIDStr := c.Param("domainID")
	domainID, err := strconv.ParseUint(domainIDStr, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid domain ID", utils.ErrBadRequest, nil)
		return
	}

	// Get the domain
	domain, result := queries.GetDomainByID(domainID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Domain not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Ensure the domain belongs to the workspace
	workspaceID, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// For security, only allow verification if domain belongs to the workspace
	if domain.WorkspaceID == nil || *domain.WorkspaceID != workspaceID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to verify this domain", utils.ErrForbidden, nil)
		return
	}

	// If domain is already verified, return success
	if domain.Verified {
		utils.FullyResponse(c, http.StatusOK, "Domain is already verified", nil, nil)
		return
	}

	// Verify the domain by checking DNS TXT record
	txtVerified, err := verifyDomainTXTRecord(domain.Domain, domain.VerifyToken)
	if err != nil {
		logger.Log.Sugar().Errorf("Error verifying domain TXT record: %v", err)
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error verifying domain", utils.ErrGetData, err)
		return
	}

	// Check if CNAME is set
	cnameVerified, cnameTarget, err := verifyDomainCNAME(domain.Domain)
	if err != nil {
		logger.Log.Sugar().Errorf("Error checking domain CNAME record: %v", err)
	}

	// Check if CNAME is correctly pointed to our expected target
	cnameCorrect := cnameVerified && strings.HasSuffix(cnameTarget, ExpectedCNAMETarget)

	if !txtVerified {
		response := map[string]interface{}{
			"domain":           domain.Domain,
			"verify_token":     domain.VerifyToken,
			"txt_record":       domain.VerifyToken,
			"instructions":     "Please add a TXT record to your domain with the following value",
			"verify_status":    "pending",
			"cname_set":        cnameVerified,
			"expected_cname":   ExpectedCNAMETarget,
			"cname_configured": cnameCorrect,
		}

		if cnameVerified {
			response["cname_target"] = cnameTarget
		}

		utils.FullyResponse(c, http.StatusBadRequest, "Domain verification failed. Please add the TXT record with the verification token", nil, response)
		return
	}

	// Mark the domain as verified
	result = queries.VerifyDomain(domainID)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to verify domain", utils.ErrSaveData, result.Error)
		return
	}

	response := map[string]interface{}{
		"domain":           domain.Domain,
		"verify_status":    "verified",
		"cname_set":        cnameVerified,
		"expected_cname":   ExpectedCNAMETarget,
		"cname_configured": cnameCorrect,
	}

	if cnameVerified {
		response["cname_target"] = cnameTarget
	}

	utils.FullyResponse(c, http.StatusOK, "Domain verified successfully", nil, response)
}

// verifyDomainTXTRecord checks if the domain has a TXT record with the verification token
func verifyDomainTXTRecord(domainName, verificationToken string) (bool, error) {
	// Get TXT records for the domain
	records, err := net.LookupTXT(domainName)
	if err != nil {
		return false, err
	}

	// Check if any TXT record contains the verification token
	return slices.Contains(records, verificationToken), nil
}

// verifyDomainCNAME checks if the domain has a CNAME record set
// Returns if CNAME exists, the target of the CNAME, and any error
func verifyDomainCNAME(domainName string) (bool, string, error) {
	cname, err := net.LookupCNAME(domainName)
	if err != nil {
		return false, "", err
	}

	// CNAME exists if we get here
	return true, cname, nil
}
