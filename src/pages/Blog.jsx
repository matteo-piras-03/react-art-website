import styles from '../assets/scss/blog.module.scss';
import poststyles from '../assets/scss/blogpost.module.scss';
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";
import ReactMarkdown from 'react-markdown';
import postsInfo from '../assets/json/blogposts.json';
import Seo from "../components/Head_info.jsx";

const VITE_MEDIA_SUBDOMAIN = import.meta.env.VITE_MEDIA_SUBDOMAIN;
const VITE_DOMAIN = import.meta.env.VITE_DOMAIN;

function Blog() {
    const { postId } = useParams();

    if (postId) {
        return <BlogPost />;
    }

    return (
        <>
        <Seo
            url={VITE_DOMAIN + "/blog"}
            title="Blog - pirAs03"
            description="A place where I write about my drawing career and the development of this website, and can yap without being judged."
            image={VITE_MEDIA_SUBDOMAIN + "/image/asset/previews/blog.jpg"}
        />
        <article id="main">
            <h1 className={styles.titlepage}>Blog</h1>
            <ul id={styles["section-0"]}>
                {postsInfo.map((post) => (
                    <li key={post.id}>
                        <Link to={`/blog/${post.id}`}>
                            <div className={styles.top}>
                                <h1 className={styles.title}>{post.title}</h1>
                                <time className={styles.date}>{formatDate(post.date)}</time>
                            </div>
                            <div className={styles.bottom}>
                                <span className={styles.description}>{post.description}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </article>
        </>
    );
}

function BlogPost() {
    const { postId } = useParams();
    const [postData, setPostData] = useState({
        md_data: null
    });

    useEffect(() => {
        const fetchPostData = async (postId) => {
            try {
                const mdResponse = await fetch(`../../assets/md/blogposts/${postId}.md`);
                const mddata = await mdResponse.text();
                setPostData(() => ({ md_data: mddata }));

            } catch (error) {
                console.error("Error fetching post data:", error);
            }
        };
        fetchPostData(postId);
    }, [postId]);
    const { title, date, description } = postsInfo.find((post) => post.id === postId);
    const formattedDate = formatDate(date);

    return (
        <>
        <Seo
            url={VITE_DOMAIN + "/blog/" + postId}
            title={title + " - Blog - pirAs03"}
            description={description}
        />
        <article id="main">
            <Suspense fallback={<h1>Loading post...</h1>}>
            <div id={poststyles["section-0"]}>
                <Link to="/blog" id={poststyles["back-button"]}>
                    <img src="../../assets/svg/chevron-left-svgrepo-com.svg" alt="Back"/> <span>Back to Blog</span>
                </Link>
                <h1 className={poststyles["title"]}>{title || "Default Title"}</h1>
                <h2 className={poststyles["date"]}>{formattedDate || "Jan 1, 1970"}</h2>
                <span className={poststyles["description"]}>{description || "Default Description"}</span>
            </div>
            <div id={poststyles["section-1"]}>
                <ReactMarkdown>{postData?.md_data || "Default Markdown Content"}</ReactMarkdown>
            </div>
            </Suspense>
        </article>
        </>
    );
}

function formatDate(value){
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export default Blog;