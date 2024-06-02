import HomePage from "@/pages/HomePage";
import { Route, Routes } from "react-router-dom";

const RouterProvider: React.FC = () => (
    <Routes>
        <Route path="/" index element={<HomePage />} />

        {/* Error 404 */}
        {/* <Route path="*" element={<Error404 />} /> */}
    </Routes>
);

export default RouterProvider;
