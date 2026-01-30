import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <React.Fragment>
      <Header />
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </React.Fragment>
  );
};
