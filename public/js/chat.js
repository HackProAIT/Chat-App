const socket = io()

//send messages functionality
//Elements
const $messageForm = document.querySelector("#Message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages")

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

//listen for messages
socket.on('message', (message) => {
    // console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscrool()
})

//challenge
//automatic scrolling
const autoscrool = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    console.log(newMessageMargin)
    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scroolOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scroolOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//send messages
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //disable send button


    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=> {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable send button
        if(error)
            return console.log(error)
        console.log('message delivered')
    })
})



//listen for locationMessages
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username : url.username,
        url : url.text,
        createdAt : moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscrool()
})

//send location
$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported on this browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit('sendLocation',{latitude : position.coords.longitude,longitude : position.coords.latitude},() => {
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

//listen for roomData
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join',{username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})