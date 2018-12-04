import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import ActionCable from "actioncable";

const roomsApiEndpoint = "http://localhost:4000/rooms";

class App extends Component {
  state = {
    rooms: [],
    currentRoomId: null,
    user_id: 1,
    cable: null,
    roomSubscription: null,
    spammerId: null
  };

  componentDidMount() {
    fetch(roomsApiEndpoint)
      .then(r => r.json())
      .then(rooms => this.setState({ rooms }));
  }

  setCurrentRoom = currentRoomId => {
    this.setState({ currentRoomId }, () => {
      this.cable = ActionCable.createConsumer("ws://localhost:4000/cable");
      const roomSubscription = this.cable.subscriptions.create(
        {
          channel: "RoomsChannel",
          room_id: this.state.currentRoomId
        },
        { received: data => console.log("The data is:", data) }
      );
      this.setState({ roomSubscription }, () => {
        console.log("I saved a reference to the subscription");
        let messageId = 0;
        const spammerId = setInterval(() => {
          this.state.roomSubscription.send({
            body: `This is message number ${++messageId} from room number ${
              this.state.currentRoomId
            }`
          });
        }, 1000);
        this.setState({ spammerId });
      });
    });
  };

  selectRoom() {
    return (
      <>
        <h1>Chat rooms:</h1>
        <ul>
          {this.state.rooms.map(roomObj => (
            <li
              key={roomObj.id}
              onClick={() => this.setCurrentRoom(roomObj.id)}
            >
              {roomObj.name}
            </li>
          ))}
        </ul>
      </>
    );
  }

  currentRoom() {
    return (
      <>
        <p
          onClick={() => {
            this.cable.subscriptions.remove(this.state.roomSubscription);
            clearInterval(this.state.spammerId);
            this.setState(
              { currentRoomId: null, roomSubscription: null },
              () => {
                console.log("I cleared the subscription");
              }
            );
          }}
        >
          Go back to rooms menu
        </p>
        <h1>Current room:</h1>
      </>
    );
  }

  render() {
    return (
      <>{!this.state.currentRoomId ? this.selectRoom() : this.currentRoom()}</>
    );
  }
}

export default App;
