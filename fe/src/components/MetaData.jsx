import { Helmet } from 'react-helmet-async';

export default function MetaData({ title, description, canonical }) {
    return (
        <Helmet>
            {title && <title>{title}</title>}
            {description && (
                <meta name="description" content={description} />
            )}
            {canonical && <link rel="canonical" href={canonical} />}
        </Helmet>
    );
}
