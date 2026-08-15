import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const [links, setLinks] = useState([]);
    const [originalUrl, setOriginalUrl] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editUrl, setEditUrl] = useState("");
    const [analytics, setAnalytics] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    function handleCopy(shortCode) {

        const shortUrl = `http://localhost/${shortCode}`;

        navigator.clipboard.writeText(shortUrl);

        alert("Short URL copied!");
    }

    async function fetchAnalytics(id) {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `/links/${id}/analytics`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAnalytics((prev) => ({
                ...prev,
                [id]: response.data
            }));

        } catch (error) {

            console.log(error.response?.data);

        }
    }

    async function handleUpdate(id) {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `/links/${id}`,
                {
                    originalUrl: editUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEditingId(null);
            setEditUrl("");

            fetchLinks();

        } catch (error) {

            console.log(error.response?.data);

        }
    }

    async function handleCreateLink(e) {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "/links",
                {
                    originalUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOriginalUrl("");

            fetchLinks();

        } catch (error) {

            console.log(error.response?.data);

        }
    }

    async function handleDelete(id) {

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `/links/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchLinks();

        } catch (error) {

            console.log(error.response?.data);

        }
    }

    async function fetchLinks() {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "/links",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLinks(response.data);

        } catch (error) {

            console.log(error.response?.data);

        }
    }

    useEffect(() => {
        fetchLinks();
    }, []);

    return (
        <>
            <nav className="navbar">

                <div className="nav-logo">
                    🔗 LinkForge
                </div>

                <div className="nav-right">

                    <span className="welcome-user">
                        {user.username}
                    </span>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            <div className="dashboard-container">

                <h2>
                    Welcome back, {user.username}
                </h2>

                <p className="dashboard-subtitle">
                    Manage all your shortened links.
                </p>

                <form
                    className="create-form"
                    onSubmit={handleCreateLink}
                >

                    <input
                        type="url"
                        placeholder="Paste your URL here..."
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Create
                    </button>

                </form>

                <h2 className="links-title">
                    Your Links
                </h2>

                {links.length === 0 ? (

                    <p>No links found.</p>

                ) : (

                    links.map((link) => (

                        <div
                            key={link._id}
                            className="link-card"
                        >

                            {editingId === link._id ? (

                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                />

                            ) : (

                                <p>
                                    <strong>🌐 Original:</strong>{" "}
                                    {link.originalUrl}
                                </p>

                            )}
                            <p>
                                <strong>🔗 Short Code:</strong>{" "}
                                {link.shortCode}
                            </p>
                            <p>
                                <strong>👆 Clicks:</strong>{" "}
                                {link.clicks}
                            </p>

                            {analytics[link._id] && (

                                <div className="analytics-box">

                                    <p>
                                        <strong>Total Clicks:</strong>{" "}
                                        {analytics[link._id].totalClicks}
                                    </p>

                                    <p>
                                        <strong>Today:</strong>{" "}
                                        {analytics[link._id].clicksToday}
                                    </p>

                                    <p>
                                        <strong>Last 7 Days:</strong>{" "}
                                        {analytics[link._id].clicksLast7Days}
                                    </p>

                                </div>

                            )}

                            {editingId === link._id ? (

                                <>

                                    <button
                                        onClick={() => handleUpdate(link._id)}
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditUrl("");
                                        }}
                                    >
                                        Cancel
                                    </button>

                                </>

                            ) : (

                                <>

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(link._id)}
                                    >
                                        Delete
                                    </button>

                                    <button
                                        className="copy-btn"
                                        onClick={() => handleCopy(link.shortCode)}
                                    >
                                        Copy
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingId(link._id);
                                            setEditUrl(link.originalUrl);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => fetchAnalytics(link._id)}
                                    >
                                        Analytics
                                    </button>

                                </>

                            )}

                        </div>

                    ))

                )}

            </div>
        </>
    );
}

export default Dashboard;