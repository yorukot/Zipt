import React from "react";

interface AuthPageLayoutProps {
  Button: React.ReactNode;
  Modal: React.ReactNode;
  Footer: React.ReactNode;
}

// Button is unused so add an eslint-disable comment
const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Button, 
  Modal, 
  Footer 
}) => {
  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Main Content */}
        <div className="h-full flex justify-center">
          <main className="flex items-center px-4 w-full max-w-[24rem]">
            {Modal}
          </main>
        </div>

        {/* Footer */}
        <footer className="p-4">
          {Footer}
        </footer>
      </div>

      {/* Background Decorations */}
      <div className="hidden md:block -z-10 fixed top-[70%] -right-[384px] blur-[512px] rounded-full h-[720px] w-[720px] bg-green/40"></div>
      <div className="hidden md:block -z-10 fixed -top-[20%] -left-[384px] blur-[512px] rounded-full h-[720px] w-[720px] bg-peach/40"></div>
    </>
  );
};

export default AuthPageLayout;
