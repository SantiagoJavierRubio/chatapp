import React, { useState, useEffect } from 'react';

const UserList = (props) => {

    const { socket } = props;
    const [userList, setUsers] = useState([]); 

    useEffect(() => {
        socket.on('users', (active_users) => {
            setUsers(active_users);
        });
    });

    return(
        <React.Fragment>
            <h3>Online now:</h3>
            <ul>
                {userList.map(user => {
                    if(socket.id === user.id){
                        return <li key={user.id}>Me</li>
                    } else {
                        return <li key={user.id}>{user.username}</li>
                    }
                })}
            </ul>
        </React.Fragment>
    )

}


export default UserList;