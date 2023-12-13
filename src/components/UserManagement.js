import React, { useState, useEffect } from "react";
import { collection, setDoc, doc, getDocs } from "firebase/firestore";
import {deleteDoc} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import {getDatabase, onValue, ref, set} from "firebase/database";
import {createUserWithEmailAndPassword} from "firebase/auth";

const db = getFirestore(app);

const UserManagement = () => {
    const [name, setName] = useState("");
    const [itsId, setItsId] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const fetchUsers = async () => {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);

        const usersData = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            usersData.push({ id: doc.id, ...userData });
        });

        setUsers(usersData);
    };

    useEffect(() => {
        fetchUsers();
    }, []); // Empty dependency array ensures useEffect runs only once on mount

    const handleAddUser = async () => {
        if (!name || !itsId || !password) {
            alert("Please fill in all fields.");
            return;
        }

        // create a new user document and also add it to the authentication list
        const usersCollection = collection(db, "users");
        const newUser = {
            name,
            id: itsId,
            password,
        };

        try {
            await setDoc(doc(usersCollection), newUser);  // Use usersCollection instead of collection(db, "users")
            alert("User added successfully!");

            await createUserWithEmailAndPassword(app, itsId + "@miqaat.bhy", password)

            await fetchUsers();

                // Clear input fields
                setName("");
                setItsId("");
                setPassword("");

        } catch (error) {
            console.error("Error adding user: ", error);
            alert("Error adding user. Please try again.");
        }
    };

    const filteredUsers = users.filter((user) =>
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.id && user.id.includes(searchQuery.toLowerCase()))
    );

    const handleDeleteUser = async (id) => {
        const userDocRef = doc(collection(db, "users"), id);

        try {
            await deleteDoc(userDocRef);  // Use userDocRef instead of doc(usersCollection, userId)
            alert("User deleted successfully!");

            // Fetch updated users after deletion
            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user: ", error);
            alert("Error deleting user. Please try again.");
        }
    }

    const updateLogoutStatus = (its) => {
        const db = getDatabase();
        set(ref(db, 'loggedInUsers/' + its), false)
            .then(() => {
                console.log(`Logout status updated for ${its}`);
            })
            .catch((error) => {
                console.error("Error updating logout status:", error);
            });
    };

    const checkLoginStatus = (its) => {
        const db = getDatabase();
        const starCountRef = ref(db, 'loggedInUsers/' + its);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });
    }

    return (
        <div className="add-user-container" style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Add New User</h2>
            <div className="add-user-form" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ margin: '5px', padding: '5px' }}
                />
                <input
                    type="text"
                    placeholder="8 Digit ITS ID"
                    value={itsId}
                    onChange={(e) => setItsId(e.target.value)}
                    style={{ margin: '5px', padding: '5px' }}
                />
                <input
                    type="password"
                    placeholder="5 Digit Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ margin: '5px', padding: '5px' }}
                />
                <button onClick={handleAddUser} style={{ margin: '5px', padding: '5px' }}>Add User</button>
            </div>

            <div className="search-bar" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by Name or ITS ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ margin: '5px', padding: '5px' }}
                />
            </div>

            <div className="user-list">
                <h2>Existing Users</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ITS ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Password</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id} style={{ border: '1px solid #ccc' }}>
                            <td style={{ padding: '10px' }}>{user.name}</td>
                            <td style={{ padding: '10px' }}>{user.id}</td>
                            <td style={{ padding: '10px' }}>{user.password}</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '5px', background: '#ff6961', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                                &nbsp;
                                <button
                                    onClick={() => {
                                        updateLogoutStatus(user.id);
                                    }}
                                    style={{
                                        padding: '5px',
                                        background: '#6495ED',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                >
                                    Logout


                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default UserManagement;
