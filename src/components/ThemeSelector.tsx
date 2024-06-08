{
    /* <div className="theme-span">
    <i className="fas fa-sun"></i>
    <label className="switch">
        <input type="checkbox" id="switch-theme" />
        <span className="slider round"></span>
    </label>
    <i className="fas fa-moon"></i>
</div>; */
}

const ThemeSelector: React.FC = () => {
    return (
        <div className="theme-span">
            <i className="fas fa-sun" />
            <label className="switch">
                <input type="checkbox" id="switch-theme" />
                <span className="slider round" />
            </label>
            <i className="fas fa-moon" />
        </div>
    );
};

export default ThemeSelector;
