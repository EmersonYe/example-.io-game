// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection } from './networking';
import { sendChat } from './networking';
import { Chat } from '../server/chat';

const chatParent = document.getElementById('chat');
const chatInput = document.getElementById('chat-input');

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}

function onKeyPress(e) {
  if (e.key === 'Enter') {
    if (chatInput === document.activeElement) {
      if (chatInput.value !== '') {
        sendChat(chatInput.value);
        console.log('Sending message: ' + chatInput.value);
      }
        chatInput.value = '';
        chatParent.classList.add('hidden');
        window.focus();
    }
    else {
      chatParent.classList.remove('hidden');
      chatInput.focus();
    }
  }
}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
}

export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  window.addEventListener('keypress', onKeyPress);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
  window.removeEventListener('keypress', onKeyPress);
}
