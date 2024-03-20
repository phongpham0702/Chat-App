let socket; // my socket
let onlineUsers = []
let userName;
let selectedUser = null;
const chatPanel = document.getElementById("chat-panel");
window.onload = () => {
    const socket = io();
    socket.on("connect", handleConnectionSuccess)
    socket.on("disconnect", () => {
        console.log("Kết nối thất bại")
    })
    socket.on("error", () => {
        console.log("Kết nối gặp lỗi")
    })
    socket.on('user-profile', handleUserProfile)
    socket.on('list-users', handleUserList)
    socket.on('new-user', handleNewUser)
    socket.on('user-leave', handleUserLeave)
    socket.on('register-name', handleUserRegister)
    socket.on('private message',handlePrivateMessage)
    socket.on('load message',handleLoadMessage)

    function handleConnectionSuccess() {
        socket.emit('user-connected')
    }

    function handleUserProfile(data) {
        let { username, avatar } = data
        let profile = document.querySelector("#userProfile")
        profile.querySelector("img").src = avatar
        profile.querySelector("span").innerText = username
    }

    function handleUserList(users) {
        users.forEach(user => {
            if (user.id !== socket.id) {
                let u = {
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar,
                }
                onlineUsers.push(u) // thêm những người đang online vào danh sách online
                displayUsers(u) // hiển thị những người dùng trong danh sách
            }
        })
    }
    function handleNewUser(user) {
        onlineUsers.push(user)
    }

    function handleUserLeave(id) {
        onlineUsers = onlineUsers.filter(user => user.id != id) // Tạo lại 1 danh sách online user khác mà không chứa user có ID đã thoát
        removeUser(id) // xóa người dùng vừa out
    }

    function handleUserRegister(data) {
        let { id, username } = data
        let user = onlineUsers.find(user => user.id == id)
        if (!user) {
            return console.log('Không tìm thấy user')
        }

        user.username = username
        displayUsers(user)// hiển thị người mới online sau khi họ đăng ký
    }

    function handlePrivateMessage(messageModel){
        if(selectedUser === messageModel.from)
        {
            addMessageToChatPanel(messageModel.content,"incoming",messageModel.sendTime)
        }
        else
        {
            let sender = document.querySelector(`#user-list [id='${messageModel.from}']`)
            if(!document.querySelector(`#user-list [id='${messageModel.from}'] .messageCounter`))
            {
                let messageCounter = document.createElement("span")
                messageCounter.classList.add("messageCounter")
                messageCounter.dataset.counter = 1
                messageCounter.textContent = messageCounter.dataset.counter
                sender.append(messageCounter)
            }
            else
            {
                let messageCounter = document.querySelector(`#user-list [id='${messageModel.from}'] .messageCounter`)
                messageCounter.dataset.counter = parseInt(messageCounter.dataset.counter) + 1
                messageCounter.textContent = parseInt(messageCounter.dataset.counter)
            }    
        }      
    }


    function displayUsers(user) {
        let listItem = document.createElement("li")
        listItem.classList.add("list-group-item", "text-center", "mt-2")
        listItem.id = user.id
        listItem.innerHTML = `
            <a href="#">
                <img src="${user.avatar}" class="rounded-circle mr-2">
            </a>
            <span>${user.username}</span>
        `
        listItem.addEventListener("click", () => {
            //Xóa form cũ để xoa luôn event submit của nó tránh việc gửi tin nhắn
            //thực hiện lại n lần khi người dùng click vào user mới
            document.querySelector(".card-footer").innerHTML = ""
            document.querySelector(".card-footer").innerHTML = `
                    <form class="input-message">
                    <div class="form-group typing-message">
                        <input type="text" class="form-control form-control-plaintext" placeholder="Type your message...">
                    </div>
                    <button type="submit" class="btn btn-outline-dark btn-xs mx-3">
                        <i class="fa-sharp fa-regular fa-paper-plane" style="color: #006cff;"></i>
                    </button>
                </form>`
            displayChatPanel(user);
        })
        document.getElementById("user-list").appendChild(listItem);
    }
    function removeUser(id) {
        $(`#${id}`).remove();
    }
    
    
    function displayChatPanel(user) {
        selectedUser = user.id
   
        if(document.querySelector(`#user-list [id='${user.id}'] .messageCounter`))
        {
            document.querySelector(`#user-list [id='${user.id}'] .messageCounter`).remove();
        }
        
        chatPanel.querySelector(".card-body .messages").innerHTML = "";

        let chatPanelHeader = chatPanel.querySelector(".card-header")
        chatPanelHeader.querySelector("a img").src = user.avatar
        chatPanelHeader.querySelector("span").textContent = `Chat with ${user.username}`
        chatPanelHeader.classList.add("visibleOn")
             
        let formElement = chatPanel.querySelector(".card-footer form")

        formElement.addEventListener("submit", formEvent)
        function formEvent(event)
        {
            event.preventDefault();
            const message = event.target.querySelector("input").value;
            let sendTime = new Date(Date.now()).toLocaleString("en-US")
            let messageModel = {
                from : socket.id,
                to: user.id,
                content: message,
                sendTime: sendTime
            }
            socket.emit("private message", { recipientId: user.id, messageModel });
            addMessageToChatPanel(message, "outgoing",sendTime);
            event.target.querySelector("input").value = "";

            const chatBox = chatPanel.querySelector("#chatBox")
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        chatPanel.querySelector(".card-footer").classList.add("visibleOn")
        socket.emit("load message",{userID: socket.id, with: user.id})
    }
    
    

    // Add message to chat panel
    function addMessageToChatPanel(text, messageType,sendTime) {
        const message = document.createElement("div");
        message.classList.add("message");
        message.classList.add(messageType);

        const messageContent = document.createElement("p")
        messageContent.textContent = text
        
        const messageTime = document.createElement("span");
        messageTime.classList.add("time");
        messageTime.textContent = sendTime;

        message.appendChild(messageContent);
        message.appendChild(messageTime);

        const chatBox = chatPanel.querySelector("#chatBox .messages")
        chatBox.appendChild(message)

        // Scroll to bottom of chat panel
        chatBox.parentElement.scrollTop = chatBox.parentElement.scrollHeight;
        
    }

    function handleLoadMessage(previousMessage)
    {
        
        if(previousMessage != "")
        {
            previousMessage.forEach(message =>{
                if(message.from == socket.id)
                {
                    addMessageToChatPanel(message.content,"outgoing",message.sendTime)
                }
                else{
                    addMessageToChatPanel(message.content,"incoming",message.sendTime)
                }
            })
        }
    }
}
