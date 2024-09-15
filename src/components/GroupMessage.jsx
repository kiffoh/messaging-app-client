import { useEffect, useState } from "react";
import styles from './groupMessage.module.css'
import axios from "axios";
const backendURL = import.meta.env.VITE_SERVER_URL;

function GroupMessage({setNewChat, filteredContacts, search, setSearch, setDisplayedChat, userChats, user, setDisplayedChatId, setUserChats, setNewGroup, handleContactSelection, contacts}) {
    const [error, setError] = useState(false);
    const [nextStage, setNextStage] = useState(false);
    const [name, setName] = useState('');
    const [file, setFile] = useState(null); // For file upload
    const [selectedContacts, setSelectedContacts] = useState([])

    const groupChats = userChats.filter(chat => chat.directMsg === false);

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        const sortedArr1 = [...arr1].sort();
        const sortedArr2 = [...arr2].sort();
        return sortedArr1.every((value, index) => value === sortedArr2[index]);
    }    

    const findUserChat = (groupMembers, groupName) => {
        const groupMemberIds = groupMembers.map(member => member.id);

        for (const chat of groupChats) {
            if (chat.name === groupName){
                const chatMemberIds = chat.members.map(member => member.id);
                if (arraysEqual(groupMemberIds, chatMemberIds)) {
                    return chat;
                }
            }
        }
        return null;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setError(false)
        }, 2000)

        return () => clearTimeout(timer); // Clean up timer on unmount
    }, [error])

    function handleNextSubmit(event) {
        event.preventDefault();

        // Displays the contacts selected for the group chat
        let tempSelectedContacts = contacts.filter(contact => contact.selected);
        
        if (tempSelectedContacts.length > 1) {
            setNextStage(true)
            setSelectedContacts(tempSelectedContacts)
        } else {
            // A group requires at least 2 other members (not including the user)
            setError(tempSelectedContacts.length === 0 ? 'A group requires at least 2 more contacts.': 'A group requires at least 1 more contact.')
            
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        try {
            const groupMembers = [user, ...selectedContacts];
            const groupName = name ? name : nameGroup(groupMembers);
            const existingChat = findUserChat(groupMembers, groupName);

            console.log(existingChat);
            
            if (existingChat) {
                setDisplayedChat(existingChat);
                setDisplayedChatId(existingChat.id);
            } else {
                // Prepare the form data
                const formData = new FormData();
                
                // Add members & name
                formData.append('members', JSON.stringify(groupMembers));
                formData.append('name', groupName)
    
                // Conditionally add the group photo if provided
                if (file) {
                    formData.append('groupPhoto', file); // `groupPhoto` is the field name the backend should expect
                }
                
                console.log(file)
    
                const response = await axios.post(`${backendURL}/groups/createGroup`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Important for file uploads
                    }
                });
    
                if (response.status === 200 || response.status === 201) {
                    console.log('GOING THROUGH RESPONSE')
                    const data = response.data.newGroup || response.data.existingGroup;
                    
                    setDisplayedChat(data);
                    setDisplayedChatId(data.id);
                    setUserChats(prevChats => [data, ...prevChats]);
                } else {
                    setError('Failed to create the group.');
                } 
            }
        } catch (err) {
            setError('An error occurred when trying to create the group.')
        }

        setNewChat(false);
        setNextStage(false);
    }

    function nameGroup(members) {
        const groupUsernames = []
        members.map(member => groupUsernames.push(member.username));
        return groupUsernames.slice(0, groupUsernames.length - 1).join(', ') + ' & ' + groupUsernames.slice(groupUsernames.length - 1);
    }

    return (
        <form onSubmit={handleFormSubmit} className={styles['group-message-form']}>
            {nextStage ? (
                <>
                    <div className={styles['selected-contacts-container']}>
                        {selectedContacts.map(contact => (
                            <div key={contact.id} className={styles['contact-div']}>
                                <img src={contact.photo} alt='contact photo' className={styles['contact-photo']} draggable='false'/>
                                <p className={styles['contact-name']}>{contact.username}</p>                  
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="photo">
                        Add group icon (optional)
                    </label>
                    <label htmlFor="name">
                        Provide a group name
                    </label>
                    <input 
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Group name (optional)"
                    />
                    <button type="button" onClick={() => setNextStage(false)}>Back</button>
                    <button type="submit">Create</button>
                </>
            ) : (
                <>
                    <button type='button' onClick={() => setNewGroup(false)}>Direct Message</button>
                    <input 
                        type="text"
                        placeholder="Search contacts"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className={styles['contacts-container']}>
                        {filteredContacts.length === 0 ? (
                            <p className={styles['no-contacts-found']}>No contacts found</p>
                        ) : (
                        filteredContacts.map(contact => (
                            <div key={contact.id} onClick={() => handleContactSelection(contact.id)} className={styles['contact-div']}>
                                <img src={contact.photo} alt='contact photo' className={styles['contact-photo']} />
                                <p className={styles['contact-name']}>{contact.username}</p>
                                <div className={styles[contact.selected? "checkbox-highlighted" : "checkbox"]}>○</div>                  
                            </div>
                        )))}
                    </div>
                    {error && <h3 className={styles['error']}>{error}</h3>}
                    <button type='button' onClick={() => setNewChat(false)}>Cancel</button>
                    <button type='button' onClick={handleNextSubmit}>Next</button>     
                </>
            )}
        </form>
    )
}

export default GroupMessage;