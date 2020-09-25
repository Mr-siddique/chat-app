let users = [];
const addUser = ({ id, username, roomname }) => {

    //clean the data
    username = username.trim().toLowerCase();
    roomname = roomname.trim().toLowerCase();

    //validate the data
    if (!username || !roomname) {
        return {
            error: 'Username and Roomname is required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.roomname == roomname && user.username == username;
    })

    //validate  user
    if (existingUser) {
        return {
            error: 'username must be unique'
        }
    }

    //if no existing user the store user
    const user = { id, username, roomname };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
const getUser = (id) => {
    return users.find(user => user.id == id);
}
const getUsersInRoom = (roomname) => {
    roomname=roomname.trim().toLowerCase();
    return users.filter(user => user.roomname == roomname)
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}