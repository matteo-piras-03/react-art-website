import { Helmet } from "react-helmet-async";

function Seo({
    title,
    description,
    url,
    image
}) {
    if (!title || !description) {
        console.warn("Missing required SEO props.");
        return null;
    }

    return (
        <Helmet>
            <title>{title}</title>

            <meta
                name="description"
                content={description}
            />

            <meta
                property="og:type"
                content="website"
            />

            {url && (
                <meta
                    property="og:url"
                    content={url}
                />
            )}

            <meta
                property="og:title"
                content={title}
            />

            <meta
                property="og:description"
                content={description}
            />

            {image && (
                <>
                    <meta
                        property="og:image"
                        content={image}
                    />

                    <meta
                        property="og:image:type"
                        content="image/jpeg"
                    />

                    <meta
                        property="og:image:width"
                        content="1920"
                    />

                    <meta
                        property="og:image:height"
                        content="1080"
                    />
                </>
            )}

            <meta
                name="twitter:card"
                content={image ? "summary_large_image" : "summary"}
            />

            {url && (
                <meta
                    name="twitter:url"
                    content={url}
                />
            )}

            <meta
                name="twitter:title"
                content={title}
            />

            <meta
                name="twitter:description"
                content={description}
            />

            {image && (
                <meta
                    name="twitter:image"
                    content={image}
                />
            )}
        </Helmet>
    );
}

export default Seo;