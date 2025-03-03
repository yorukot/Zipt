// components/AuthPageLayout.tsx
import React from "react";
import { ToggleTheme } from "../toggle-theme";
import SelectLanguage from "../select-language";
import Image from "next/image";

interface AuthPageLayoutProps {
  Button: React.ReactNode;
  Modal: React.ReactNode;
  Footer: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ Button, Modal, Footer }) => {
  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Navigation Bar */}
        <nav className="grid sticky top-0 px-4 py-2 items-center grid-cols-2 z-10">
          <div>
            <Image
              src="/logo.png"
              alt="InstructHub Logo"
              height={40}
              width={40}
              className="w-10 h-10"
            />
          </div>
          <div className="self-end flex justify-end items-center space-x-3">
            <ToggleTheme />
            <SelectLanguage />
            {Button}
          </div>
        </nav>

        {/* Main Content */}
        <div className="h-full flex justify-center">
          <main className="flex items-center px-4 w-full max-w-[24rem]">
            {Modal}
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-mantle justify-self-end h-20 flex justify-center items-center">
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
