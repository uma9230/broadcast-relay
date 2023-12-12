import React, {useEffect, useState} from "react";
import {collection, deleteDoc, doc, getDocs, getFirestore, setDoc} from "firebase/firestore";
import {app} from "../firebase";


const UserManagement = () => {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const db = getFirestore(app)

    const fetchUsers = async () => {
        try {
            // Assuming "users" is the collection containing individual user documents
            const usersRef = collection(db, "users");

            // Fetch all user documents
            const snapshot = await getDocs(usersRef);

            const usersData = [];
            snapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });

            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        try {
            // Assuming "users" is a collection
            const usersRef = collection(db, "users");

            // Add a new document with the specified ID (using the user's ID)
            const newUserRef = doc(usersRef, id);

            // Set the name and password as fields within the new user's document
            await setDoc(newUserRef, {
                name,
                password,
            });

            // Clear the input fields after adding a user
            setName("");
            setId("");
            setPassword("");

            // Fetch users again after addition
            fetchUsers();
        } catch (error) {
            console.error("Error adding user: ", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Assuming "users" is the collection containing individual user documents
            const usersRef = collection(db, "users");

            // Reference the user's document by ID
            const userDocRef = doc(usersRef, userId);

            // Delete the user's document
            await deleteDoc(userDocRef);

            setDeletingUserId(null);

            // Fetch users again after deletion
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user: ", error);
        }
    };


    return (
        <div className="user-management">
            <h2>Add New User</h2>
            <div className="user-form">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="8 Digit ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="5 Digit Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="add-button" onClick={handleAddUser}>
                    Add User
                </button>
            </div>
            <h2>Existing Users</h2>
            <div className="user-list">
                {users.map((user) => (
                    <div key={user.id} className="user-item">
                        <span className="user-info">{user.name}</span>
                        <span className="user-info">{user.id}</span>
                        <span className="user-info">{user.password}</span>
                        <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
