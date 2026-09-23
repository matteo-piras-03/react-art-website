import styles from '../assets/scss/art.module.scss';
import collectionstyles from '../assets/scss/collection_page.module.scss';
import { memo, useEffect, useState, useReducer, useTransition, useCallback, useMemo} from 'react';
import Seo from "../components/Head_info.jsx";
import { Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import { createPortal } from 'react-dom';

const VITE_MEDIA_SUBDOMAIN = import.meta.env.VITE_MEDIA_SUBDOMAIN;
const VITE_DOMAIN = import.meta.env.VITE_DOMAIN;

const artGalleryFiles = Object.values(
    import.meta.glob("../assets/json/collection_list/*.json", { eager: true, import: "default" })
);

const mediumList = Array.from(new Set(artGalleryFiles.flatMap(file => file.mediums))).sort();

const tagList = Array.from(new Set(artGalleryFiles.flatMap(file => file.tags))).sort();

const MediumState = {
    selected: null,
    empty: true
};

function initialMediumState() {
    return {
        selected: null,
        empty: true
    }
}

const TagState = {
    selected: null,
    empty: true
};

function initialTagState() {
    return {
        selected: null,
        empty: true
    }
};

function handleMenuOptionChange(state, action) {
    if (action === "clear") {
        return{
            ...state,
            selected: null,
            empty: true
        }
    }
    if (state.empty) {
        return{
            ...state,
            selected: [action],
            empty: false
        };
    }
    if (state.selected.includes(action)) {
        if (state.selected.length === 1) {
            return{
                ...state,
                selected: null,
                empty: true
            };
        }
        else {
            return{
                ...state,
                selected: state.selected.filter(item => item !== action)
            };
        }
    }
    else {
        return{
            ...state,
            selected: [...state.selected, action]
        };
    }
}

function sortFiles(files, sortOption) {
    return [...files].sort((a, b) => {
        const dateDifference = new Date(a.date) - new Date(b.date);
        return sortOption === "Newest first" ? -dateDifference : dateDifference;
    });
}

function applyFilters(files, mediumOption, tagOption) {
    return files.filter(file => {
        const matchesMedium = mediumOption.empty || file.mediums.some(medium => mediumOption.selected.includes(medium));
        const matchesTag = tagOption.empty || file.tags.some(tag => tagOption.selected.includes(tag));
        return matchesMedium && matchesTag;
    });
}

function Art() {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;
    const [modalLocation, setModalLocation] = useState(null);

    useEffect(() => {
        if (backgroundLocation) {
            setModalLocation(location);
        }
    }, [backgroundLocation, location]);

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route path="/" element={<GalleryPage />} />
                <Route path=":artId" element={<CollectionPage />} />
            </Routes>

            {modalLocation && (
                <Routes location={modalLocation}>
                    <Route
                        path=":artId"
                        element={
                            <CollectionModal
                                key={modalLocation.pathname}
                                visible={Boolean(backgroundLocation)}
                            />
                        }
                    />
                </Routes>
            )}
        </>
    );
}

export default Art;

function GalleryPage() {
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [mediumMenuOpen, setMediumMenuOpen] = useState(false);
    const [tagMenuOpen, setTagMenuOpen] = useState(false);
    const [sortOption, setSortOption] = useState("Newest first");
    const [mediumOption, setMediumOption] = useReducer(handleMenuOptionChange, MediumState, initialMediumState);
    const [tagOption, setTagOption] = useReducer(handleMenuOptionChange, TagState, initialTagState);
    const [isPending, startTransition] = useTransition();

    const closeAllMenus = useCallback((type) => {
        switch (type) {
            case "sort-select":
                setMediumMenuOpen(false);
                setTagMenuOpen(false);
                break;
            case "medium-select":
                setSortMenuOpen(false);
                setTagMenuOpen(false);
                break;
            case "tag-select":
                setSortMenuOpen(false);
                setMediumMenuOpen(false);
                break;
            default:
                setSortMenuOpen(false);
                setMediumMenuOpen(false);
                setTagMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('click', closeAllMenus);

        return () => document.removeEventListener('click', closeAllMenus);
    }, []);
    
    const handleSortOptionChange = (option) => {
        startTransition(() => {
            setSortOption(option);
        });
        closeAllMenus("sort-select");
    }

    const handleMediumOptionChange = (option) => {
        startTransition(() => {
            setMediumOption(option);
        });
    };

    const handleTagOptionChange = (option) => {
        startTransition(() => {
            setTagOption(option);
        });
    };

    const galleryKey = [
        sortOption,
        mediumOption.selected?.join("|") ?? "all-mediums",
        tagOption.selected?.join("|") ?? "all-tags"
    ].join("::");
    return (
    <>
        <Seo
            title="Art - pirAs03"
            description="A collection of my artwork over the years, showcasing various styles and mediums, customizable by the user."
            url={VITE_DOMAIN + "/art"}
            image={VITE_MEDIA_SUBDOMAIN + "/image/asset/previews/art.jpg"}
        />
            <article id="main">
                <h1 className={styles["title"]}>Art Gallery</h1>
                <div id={styles["section-0"]}>
                    <div id={styles["sort"]}>
                        <label>Sort:</label>
                        <button id={styles["sort-select"]} onClick={(event) => { event.stopPropagation(); closeAllMenus("sort-select"); setSortMenuOpen(isOpen => !isOpen); }}>
                            <span>{sortOption}</span>
                            <img src="../../assets/svg/chevron-down-svgrepo-com.svg" className={sortMenuOpen ? styles["flipped"] : ""}/>
                        </button>
                        <div className={`${styles["menu"]} ${sortMenuOpen ? styles["open"] : ""}`}>
                            <button className={`${styles["radio"]} ${sortOption === "Newest first" ? styles["selected"] : ""}`} onClick={() => handleSortOptionChange("Newest first")}>
                                <div></div>
                                <span>Newest first</span>
                            </button>
                            <button className={`${styles["radio"]} ${sortOption === "Oldest first" ? styles["selected"] : ""} ${styles["last-no-clear"]}`} onClick={() => handleSortOptionChange("Oldest first")}>
                                <div></div>
                                <span>Oldest first</span>
                            </button>
                        </div>
                    </div>
                    <div id={styles["medium"]}>
                        <label>Mediums:</label>
                        <button id={styles["medium-select"]} onClick={(event) => { event.stopPropagation(); closeAllMenus("medium-select"); setMediumMenuOpen(isOpen => !isOpen); }}>
                            <span>{(mediumOption.empty || mediumOption.selected.length === mediumList.length) ? "All mediums" : (mediumOption.selected.length + " selected")}</span>
                            <img src="../../assets/svg/chevron-down-svgrepo-com.svg" className={mediumMenuOpen ? styles["flipped"] : ""}/>
                        </button>
                        <div className={`${styles["menu"]} ${mediumMenuOpen ? styles["open"] : ""}`}>
                            {mediumList.map((medium, index) => (
                                <button key={medium} className={mediumOption.selected?.includes(medium) ? styles["selected"] : ""} onClick={(event) => { event.stopPropagation(); handleMediumOptionChange(medium); }}>
                                    <div></div>
                                    <span>{medium}</span>
                                </button>
                            ))}
                            <button className={styles["last"]} onClick={(event) => { event.stopPropagation(); handleMediumOptionChange("clear"); }}>
                                <span>Clear all</span>
                            </button>
                        </div>
                    </div>
                    <div id={styles["tag"]}>
                        <label>Tags:</label>
                        <button id={styles["tag-select"]} onClick={(event) => { event.stopPropagation(); closeAllMenus("tag-select"); setTagMenuOpen(isOpen => !isOpen); }}>
                            <span>{(tagOption.empty || tagOption.selected.length === tagList.length) ? "All tags" : (tagOption.selected.length + " selected")}</span>
                            <img src="../../assets/svg/chevron-down-svgrepo-com.svg" className={tagMenuOpen ? styles["flipped"] : ""}/>
                        </button>
                        <div className={`${styles["menu"]} ${tagMenuOpen ? styles["open"] : ""}`}>
                            {tagList.map((tag, index) => (
                                <button key={tag} className={tagOption.selected?.includes(tag) ? styles["selected"] : ""} onClick={(event) => { event.stopPropagation(); handleTagOptionChange(tag); }}>
                                    <div></div>
                                    <span>{tag}</span>
                                </button>
                            ))}
                            <button className={styles["last"]} onClick={(event) => { event.stopPropagation(); handleTagOptionChange("clear"); }}>
                                <span>Clear all</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id={styles["section-1"]} aria-busy={isPending}>
                    <DisplayArtGalleryFiles
                        key={galleryKey}
                        sortOption={sortOption}
                        mediumOption={mediumOption}
                        tagOption={tagOption}
                    />
                </div>
            </article>
        </>
    );
}

const DisplayArtGalleryFiles = memo(function DisplayArtGalleryFiles({ sortOption, mediumOption, tagOption }) {
    const location = useLocation();
    const files = useMemo(() => sortFiles(
        applyFilters(artGalleryFiles, mediumOption, tagOption),
        sortOption
    ), [sortOption, mediumOption, tagOption]);
    return (
        <>
        {files.map((file) => (
            <Link className={styles["card"]} to={`/art/${file.handle}`} key={file.handle} state={{ backgroundLocation: location }}>
                <div className={styles["img-container"]}>
                    <img src={VITE_MEDIA_SUBDOMAIN + "/image/" + file.handle + "/" + file["thumbnail-id"] + ".jpg"} />
                </div>
                <div className={styles["title-date"]}>
                    <h1>{file.title}</h1>
                    <time className={styles["date"]} dateTime={file.date}>
                        {new Date(file.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                </div>
                <div className={styles["medium-tags"]}>
                    {file.mediums.map((medium, index) => (
                        <span key={medium}>{medium}</span>
                    ))}
                    {file.tags.map((tag, index) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            </Link>
        ))}
        </>
    );
});

function CollectionPage() {
    const { artId } = useParams();
    const collection = artGalleryFiles.find(file => file.handle === artId);
    if (!collection) {
        return(
            <>
                <article id="main">
                    <Link to="/art" id={collectionstyles["back-button"]}>
                        <img src="../../assets/svg/chevron-left-svgrepo-com.svg" alt="Back"/> <span>Back to Art</span>
                    </Link>
                    <div id={collectionstyles["collection-page"]}>
                        <div className={collectionstyles["title-date"]}>
                            <h1>Collection not found</h1>
                            <time className={collectionstyles["date"]}>
                            </time>
                        </div>
                    </div>
                </article>
            </>
        );
    }
    return (
        <>
            <Seo
                url={VITE_DOMAIN + "/art/" + artId}
                title={collection.title + " - Art - pirAs03"}
                description="A collection of drawings made by pirAs03."
                image={VITE_MEDIA_SUBDOMAIN + "/image/" + collection.handle + "/" + collection["thumbnail-id"] + ".jpg"}
            />
            <article id="main">
                <Link to="/art" id={collectionstyles["back-button"]}>
                    <img src="../../assets/svg/chevron-left-svgrepo-com.svg" alt="Back"/> <span>Back to Art</span>
                </Link>
                <div id={collectionstyles["collection-page"]}>
                    <div className={collectionstyles["title-date"]}>
                        <h1>{collection.title}</h1>
                        <time className={collectionstyles["date"]} dateTime={collection.date}>
                            {new Date(collection.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </time>
                    </div>
                    <div className={collectionstyles["medium-tags"]}>
                        {collection.mediums.map((medium, index) => (
                            <span key={index}>{medium}</span>
                        ))}
                        {collection.tags.map((tag, index) => (
                            <span key={index}>{tag}</span>
                        ))}
                    </div>
                    <CollectionCarousel collection={collection} styles={collectionstyles} />
                </div>
            </article>
        </>
    );
}

const carouselState = {
    currentIndex: 0,
    drawings: []
}

function initialCarouselState(collection) {
    return {
        currentIndex: (parseInt(collection["thumbnail-id"]) - 1) || 0,
        drawings: collection.drawings || []
    };
}

function CarouselLogic(state, action) {
    if (action.type === "reset") {
        return initialCarouselState(action.collection);
    }

    const totalDrawings = state.drawings.length;
    switch (action.type ?? action) {
        case "next":
            return {
                ...state,
                currentIndex: (state.currentIndex + 1) % totalDrawings
            };
        case "prev":
            return {
                ...state,
                currentIndex: (state.currentIndex - 1 + totalDrawings) % totalDrawings
            };
        default:
            return state;
    }
}

function CollectionCarousel({ collection, visible, styles }){
    const [cState, setCState] = useReducer(CarouselLogic, carouselState, () => initialCarouselState(collection));

    useEffect(() => {
        setCState({ type: "reset", collection });
    }, [collection, visible]);

    if (!cState.drawings.length) {
        return null;
    }

    return(
        <>
        <div className={styles["img-carousel"]}>
            <img src={VITE_MEDIA_SUBDOMAIN + "/image/" + collection.handle + "/" + cState.drawings[cState.currentIndex].id + ".jpg"} alt={collection.title} />
            <button type="button" className={styles["left"]} aria-label="Previous image" onClick={() => setCState("prev")}>
                <img src="../../assets/svg/chevron-left-svgrepo-com.svg" alt="Previous"/>
            </button>
            <button type="button" className={styles["right"]} aria-label="Next image" onClick={() => setCState("next")}>
                <img src="../../assets/svg/chevron-right-svgrepo-com.svg" alt="Next"/>
            </button>
        </div>
        <div className={styles["drawing-info"]}>
            <div className={styles["title-date"]}>
                <h1>{cState.drawings[cState.currentIndex].title}</h1>
                <time className={styles["date"]} dateTime={cState.drawings[cState.currentIndex].date}>
                    {new Date(cState.drawings[cState.currentIndex].date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </time>
            </div>
            <p>{cState.drawings[cState.currentIndex].caption}</p>
        </div>
        </>
    );
}

function CollectionModal({ visible }) {
    const { artId } = useParams();
    const collection = artGalleryFiles.find(file => file.handle === artId);

    useEffect(() => {
        document.body.style.overflow = visible ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [visible]);

    if (!collection) {
        return createPortal(
            <>
                <div id={styles["modal-view"]} className={visible ? styles["visible"] : styles["hidden"]}>
                    <div id={styles["modal-view-sub"]}>
                        <div className={styles["title-date"]}>
                            <h1>Collection not found</h1>
                            <time className={styles["date"]}>
                            </time>
                        </div>
                    </div>
                </div>
            </>
        , document.body);
    }
    return createPortal(
        <>
            <Seo
                url={VITE_DOMAIN + "/art/" + artId}
                title={collection.title + " - Art - pirAs03"}
                description="A collection of drawings made by pirAs03."
                image={VITE_MEDIA_SUBDOMAIN + "/image/" + collection.handle + "/" + collection["thumbnail-id"] + ".jpg"}
            />
            <div id={styles["modal-view"]} className={visible ? styles["visible"] : styles["hidden"]} onClick={(event) => { if (event.target.id === styles["modal-view"]) { window.history.back(); } }}>
                <div id={styles["modal-view-sub"]}>
                    <div className={styles["title-date"]}>
                        <h1>{collection.title}</h1>
                        <time className={styles["date"]} dateTime={collection.date}>
                            {new Date(collection.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </time>
                    </div>
                    <div className={styles["medium-tags"]}>
                        {collection.mediums.map((medium, index) => (
                            <span key={index}>{medium}</span>
                        ))}
                        {collection.tags.map((tag, index) => (
                            <span key={index}>{tag}</span>
                        ))}
                    </div>
                    <CollectionCarousel collection={collection} visible={visible} styles={styles} />
                    <Link to="/art" id={styles["back-button"]}>
                        <img src="../../assets/svg/chevron-left-svgrepo-com.svg" alt="Back"/> <span>Back to Art</span>
                    </Link>
                </div>
            </div>
        </>
    , document.body);
}