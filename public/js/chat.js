//io()=>used to send aswell as recieve events
const socket = io();

const $form = document.querySelector('#form');
const $formInput = $form.querySelector('#inputField');
const $formButton = $form.querySelector('button');
const $currentLocation = document.getElementById('location');
const $messages = document.getElementById('messages');
const $sideBar = document.getElementById('sidebar');
//templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sideBarTemplate = document.getElementById('sidebar-template').innerHTML;

//for scrolling the screen automatcally
const autoScroll = () => {
    //new messageElement
    const $newMessage = $messages.lastElementChild;
    //heights of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //visible height
    const visibleHeight = $messages.offsetHeight;
    //height of message container
    const containerHeight = $messages.scrollHeight;

    //how far to scroll
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset)
        $messages.scrollTop = $messages.scrollHeight;
}
const { username, roomname } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    //using Mustache liberary
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,

        //using noment liberary (for decorating time stams in a useful manner)
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})
socket.on('roomData', ({ roomname, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        roomname,
        users
    })
    $sideBar.innerHTML = html;
})
$form.addEventListener('submit', (e) => {
    e.preventDefault();
    //disabling the button for a moment
    $formButton.setAttribute('disabled', 'disabled');
    // TARGETING INPUT FIELD BY ITS NAME
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {

        //reenabling the form button
        $formButton.removeAttribute('disabled');
        $formInput.value = "";
        $formInput.focus();
        // this function runs to acchnowledge the user
        if (error) {
            return console.log(error);
        }
        console.log("Message delivered");
    });
})

//for fetching location
$currentLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }

    $currentLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        socket.emit('sendLocation', { latitude, longitude }, () => {
            console.log('location shared!');
            $currentLocation.removeAttribute('disabled');
        })
    })
})
socket.emit('join', { username, roomname }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});