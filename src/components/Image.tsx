interface ImageProps {
    children?: React.ReactNode;
    src?: string;
    alt: string;
    classNamePicture?: string;
    classNameImage?: string;
    loading?: "lazy" | "eager";
    decoding?: "async" | "auto" | "sync";
}

const Image: React.FC<ImageProps> = ({ children, src, alt, classNamePicture, classNameImage, loading, decoding }) => (
    <picture className={classNamePicture}>
        {children}
        {src && <img src={src} alt={alt} className={classNameImage} loading={loading} decoding={decoding} />}
    </picture>
);

export default Image;
