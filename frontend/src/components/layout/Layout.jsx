import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar/Sidebar";
export const Layout = () => {
  const [showSideBar, setShowSidebar] = useState(true);

  const handleSidebar = () => {
    setShowSidebar(!showSideBar);
  };
  return (
    <div className="h-screen min-h-0 overflow-hidden w-full flex flex-col relative bg-MaingBg">
      <div className="flex w-full h-full min-h-0 overflow-hidden">
        {showSideBar && (
          <Sidebar
            handleClose={() => setShowSidebar(false)}
            className={"flex-[1] h-full"}
          />
        )}

        <div className="flex-[6]  px-2  w-full h-full overflow-hidden max-md:overflow-auto min-h-0 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
