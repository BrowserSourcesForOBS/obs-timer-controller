import "@/styles/main.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import Layout from "@/components/Layout";
import RouterProvider from "@/context/RouterProvider";

const documentRoot = document.getElementById("root") as HTMLDivElement;
ReactDOM.createRoot(documentRoot).render(
    <React.StrictMode>
        <BrowserRouter>
            <Layout>
                <RouterProvider />
            </Layout>
        </BrowserRouter>
    </React.StrictMode>
);
