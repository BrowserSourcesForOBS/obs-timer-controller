const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div className="layout">
            <main className="layout-container">{children}</main>
        </div>
    );
};

export default Layout;
