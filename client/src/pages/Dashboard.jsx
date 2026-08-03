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
    const user = JSON.parse(localStorage.getItem("user"));
    function handleLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

}
function handleCopy(shortCode) {

    const shortUrl =
        `http://localhost:5000/${shortCode}`;

    navigator.clipboard.writeText(shortUrl);

    alert("Short URL copied!");
}
async function handleUpdate(id) {

    try {

        const token = localStorage.getItem("token");

        await axios.put(
            `http://localhost:5000/links/${id}`,
            {
                originalUrl: editUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Exit edit mode
        setEditingId(null);

        // Clear input
        setEditUrl("");

        // Refresh list
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
            "http://localhost:5000/links",
            {
                originalUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Clear input box
        setOriginalUrl("");

        // Fetch updated links
        fetchLinks();

    } catch (error) {
        console.log(error.response?.data);
    }
}
async function handleDelete(id) {

    try {

        const token = localStorage.getItem("token");

        await axios.delete(
            `http://localhost:5000/links/${id}`,
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

                // Get JWT stored during login
                const token = localStorage.getItem("token");

                // Send GET request to backend
                const response = await axios.get(
                    "http://localhost:5000/links",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Save links in React state
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
                onChange={(e)=>setOriginalUrl(e.target.value)}
                required
            />

            <button type="submit">
                Create
            </button>

        </form>

        <h2 className="links-title">
            Your Links
        </h2>

        {links.length===0 ? (

            <p>No links found.</p>

        ) : (

            links.map((link)=>(

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
        <strong>🌐 Original:</strong> {link.originalUrl}
    </p>

)}
<p>
    <strong>🔗 Short:</strong>{" "}
    <a
        href={`http://localhost:5000/${link.shortCode}`}
        target="_blank"
        rel="noopener noreferrer"
        className="short-link"
    >
        http://localhost:5000/{link.shortCode}
    </a>
</p>

                    <p>
                        <strong>👆 Clicks:</strong> {link.clicks}
                    </p>

<div className="card-actions">

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
        </>

    )}

</div>
                </div>

            ))

        )}

    </div>
    </>
);
}

export default Dashboard;