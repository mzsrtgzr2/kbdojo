
import React from 'react';
import Loader from './Loader';

interface Props {
    storage: firebase.storage.Storage,
    imageKey: string,
    className?: string
}
export default function ({ imageKey, storage, className }: Props) {
    /**
     * Load image from Firebase storage
     */
    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        try {
            console.log(`getting url for image ${imageKey}`)
            if (!!imageKey) {

                storage.ref(imageKey)
                    .getDownloadURL()
                    .then(setUrl)
                    .catch(e => console.log(e));
            } else {
                setUrl(null);
            }
        } catch (e) {
            console.error(e);
        }
    }, [imageKey]);

    if (!url) {
        return <Loader label="" />;
    }

    return <img alt="image" src={url} className={className} />;
}