/* ─────────────────────────────────────────────────────────
   Chat App — app.js
   ───────────────────────────────────────────────────────── */

// ── Data ───────────────────────────────────────────────────

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😅','🙌',
  '👍','❤️','🔥','🎉','✅','💯','🙏','😭',
  '😱','🤣','💪','🥳'
];

const CONTACTS = [
  {
    id: 1,
    name: 'Alice Mercer',
    initials: 'AM',
    color: '#7c5cbf',
    online: true,
    unread: 3,
    lastTime: '10:42',
    lastMsg: 'See you tomorrow! 😊',
    messages: [
      { id: 1,  type: 'recv', text: 'Hey! How are you doing?',                        time: '10:01' },
      { id: 2,  type: 'recv', text: 'Been a while since we last talked.',             time: '10:01' },
      { id: 3,  type: 'sent', text: "I'm great, thanks! Just been super busy lately.",time: '10:05' },
      { id: 4,  type: 'sent', text: 'How about you?',                                 time: '10:05' },
      { id: 5,  type: 'recv', text: 'Same here, crazy week at work.',                 time: '10:08' },
      { id: 6,  type: 'recv', text: 'But things are looking up now 🙌',               time: '10:08' },
      { id: 7,  type: 'recv', text: 'Are you free this weekend?',                     time: '10:09' },
      { id: 8,  type: 'sent', text: 'Yeah, Saturday should work!',                    time: '10:22' },
      { id: 9,  type: 'sent', text: 'We could grab coffee at that new place downtown.', time: '10:22' },
      { id: 10, type: 'recv', text: 'That sounds perfect! 😍',                        time: '10:35' },
      { id: 11, type: 'recv', text: 'I\'ll send you the address later.',              time: '10:35' },
      { id: 12, type: 'recv', text: 'See you tomorrow! 😊',                           time: '10:42' },
    ]
  },
  {
    id: 2,
    name: 'Ben Carter',
    initials: 'BC',
    color: '#e07b39',
    online: true,
    unread: 0,
    lastTime: '09:30',
    lastMsg: 'Got it, will do 👍',
    messages: [
      { id: 1,  type: 'sent', text: 'Morning Ben! Can you send me the report?',       time: '08:50' },
      { id: 2,  type: 'recv', text: 'Morning! Sure, give me a few minutes.',          time: '08:53' },
      { id: 3,  type: 'recv', text: 'Just wrapping up the last section.',             time: '08:53' },
      { id: 4,  type: 'sent', text: 'No rush, just need it before the 10am call.',   time: '08:55' },
      { id: 5,  type: 'recv', text: 'Absolutely, sending it now.',                   time: '09:04' },
      { id: 6,  type: 'recv', text: '📎 Q3_Report_Final.pdf',                        time: '09:04' },
      { id: 7,  type: 'sent', text: 'Perfect, thank you!',                           time: '09:06' },
      { id: 8,  type: 'sent', text: 'BTW the design review is pushed to Friday.',    time: '09:10' },
      { id: 9,  type: 'recv', text: 'Ah good to know, I had a conflict on Thursday.', time: '09:14' },
      { id: 10, type: 'sent', text: 'Let me know if you need anything else.',        time: '09:22' },
      { id: 11, type: 'recv', text: 'Will do!',                                       time: '09:28' },
      { id: 12, type: 'recv', text: 'Got it, will do 👍',                            time: '09:30' },
    ]
  },
  {
    id: 3,
    name: 'Clara Nguyen',
    initials: 'CN',
    color: '#2a9d8f',
    online: false,
    unread: 1,
    lastTime: 'Yesterday',
    lastMsg: 'Thanks for the help!',
    messages: [
      { id: 1,  type: 'recv', text: 'Hi! Are you around?',                           time: 'Tue 14:00' },
      { id: 2,  type: 'sent', text: 'Hey Clara! Yes, what\'s up?',                  time: 'Tue 14:02' },
      { id: 3,  type: 'recv', text: 'I\'m having trouble with the CSS layout.',     time: 'Tue 14:03' },
      { id: 4,  type: 'recv', text: 'The sidebar keeps overflowing on mobile.',     time: 'Tue 14:03' },
      { id: 5,  type: 'sent', text: 'Try adding `overflow: hidden` to the parent.', time: 'Tue 14:06' },
      { id: 6,  type: 'sent', text: 'Also check if you have `min-width` set.',      time: 'Tue 14:06' },
      { id: 7,  type: 'recv', text: 'Oh that fixed it!! You\'re a lifesaver 🙏',   time: 'Tue 14:10' },
      { id: 8,  type: 'sent', text: 'Happy to help!',                               time: 'Tue 14:11' },
      { id: 9,  type: 'recv', text: 'One more thing — the font isn\'t loading.',    time: 'Tue 14:15' },
      { id: 10, type: 'sent', text: 'Check the network tab for 404s on the font files.', time: 'Tue 14:18' },
      { id: 11, type: 'recv', text: 'Found it! Wrong path in the CSS.',             time: 'Tue 14:22' },
      { id: 12, type: 'recv', text: 'Thanks for the help!',                         time: 'Tue 18:47' },
    ]
  },
  {
    id: 4,
    name: 'Dev Team 🛠️',
    initials: 'DT',
    color: '#e63946',
    online: true,
    unread: 7,
    lastTime: 'Yesterday',
    lastMsg: 'Deploy scheduled for 6pm.',
    messages: [
      { id: 1,  type: 'recv', text: 'Heads up: CI pipeline is failing on main.',    time: 'Mon 09:00' },
      { id: 2,  type: 'recv', text: 'Looks like a dependency version conflict.',    time: 'Mon 09:00' },
      { id: 3,  type: 'sent', text: 'On it, checking now.',                         time: 'Mon 09:03' },
      { id: 4,  type: 'sent', text: 'Found it — the lodash bump broke a test.',     time: 'Mon 09:18' },
      { id: 5,  type: 'sent', text: 'PR up for review: #412',                       time: 'Mon 09:20' },
      { id: 6,  type: 'recv', text: 'Nice catch! Approved ✅',                      time: 'Mon 09:35' },
      { id: 7,  type: 'recv', text: 'Pipeline is green now.',                       time: 'Mon 09:55' },
      { id: 8,  type: 'sent', text: 'Great! Merging now.',                          time: 'Mon 10:00' },
      { id: 9,  type: 'recv', text: 'Staging deploy done, all checks passing.',     time: 'Mon 13:30' },
      { id: 10, type: 'recv', text: 'QA sign-off received.',                        time: 'Mon 15:00' },
      { id: 11, type: 'sent', text: 'Perfect, let\'s ship it.',                     time: 'Mon 16:45' },
      { id: 12, type: 'recv', text: 'Deploy scheduled for 6pm.',                   time: 'Mon 17:00' },
    ]
  },
  {
    id: 5,
    name: 'Maya Patel',
    initials: 'MP',
    color: '#457b9d',
    online: false,
    unread: 0,
    lastTime: 'Mon',
    lastMsg: 'Sounds like a plan 🎉',
    messages: [
      { id: 1,  type: 'sent', text: 'Maya! Long time no talk 😄',                  time: 'Sun 11:00' },
      { id: 2,  type: 'recv', text: 'Oh wow, hey! It really has been ages!',       time: 'Sun 11:08' },
      { id: 3,  type: 'sent', text: 'How\'s the new job going?',                   time: 'Sun 11:09' },
      { id: 4,  type: 'recv', text: 'Honestly? It\'s amazing.',                    time: 'Sun 11:15' },
      { id: 5,  type: 'recv', text: 'Great team, interesting projects.',           time: 'Sun 11:15' },
      { id: 6,  type: 'recv', text: 'I\'m learning so much every day.',            time: 'Sun 11:16' },
      { id: 7,  type: 'sent', text: 'That\'s awesome to hear!',                    time: 'Sun 11:20' },
      { id: 8,  type: 'sent', text: 'We should celebrate. Happy hour soon?',       time: 'Sun 11:20' },
      { id: 9,  type: 'recv', text: 'Absolutely yes!!',                            time: 'Sun 11:25' },
      { id: 10, type: 'recv', text: 'How about next Thursday?',                    time: 'Sun 11:25' },
      { id: 11, type: 'sent', text: 'Thursday works perfectly for me.',            time: 'Sun 11:28' },
      { id: 12, type: 'recv', text: 'Sounds like a plan 🎉',                       time: 'Sun 11:30' },
    ]
  }
];

// ── State ──────────────────────────────────────────────────
let activeId = 1;

// ── DOM refs ───────────────────────────────────────────────
const contactList   = document.getElementById('contactList');
const messagesArea  = document.getElementById('messagesArea');
const headerAvatar  = document.getElementById('headerAvatar');
const headerName    = document.getElementById('headerName');
const onlineDot     = document.getElementById('onlineDot');
const statusText    = document.getElementById('statusText');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendBtn');
const emojiToggle   = document.getElementById('emojiToggle');
const emojiPicker   = document.getElementById('emojiPicker');

// ── Sidebar ────────────────────────────────────────────────
function renderSidebar() {
  contactList.innerHTML = '';
  CONTACTS.forEach(c => {
    const li = document.createElement('li');
    li.className = 'contact-item' + (c.id === activeId ? ' active' : '');
    li.dataset.id = c.id;
    li.innerHTML = `
      <div class="contact-avatar" style="background:${c.color}">${c.initials}</div>
      <div class="contact-info">
        <div class="contact-top">
          <span class="contact-name">${c.name}</span>
          <span class="contact-time">${c.lastTime}</span>
        </div>
        <div class="contact-bottom">
          <span class="contact-preview">${escHtml(c.lastMsg)}</span>
          ${c.unread ? `<span class="unread-badge">${c.unread}</span>` : ''}
        </div>
      </div>`;
    li.addEventListener('click', () => switchContact(c.id));
    contactList.appendChild(li);
  });
}

// ── Header ─────────────────────────────────────────────────
function renderHeader(c) {
  headerAvatar.textContent     = c.initials;
  headerAvatar.style.background = c.color;
  headerName.textContent       = c.name;
  onlineDot.className          = 'online-dot ' + (c.online ? 'online' : 'offline');
  statusText.textContent       = c.online ? 'Online' : 'Last seen recently';
}

// ── Messages ───────────────────────────────────────────────
function renderMessages(messages) {
  messagesArea.innerHTML = '';

  // Group by date (we use a simple "Today" label for demo)
  const divider = document.createElement('div');
  divider.className = 'date-divider';
  divider.innerHTML = '<span>Today</span>';
  messagesArea.appendChild(divider);

  messages.forEach((msg, idx) => {
    const prev = messages[idx - 1];
    const sameAsPrev = prev && prev.type === msg.type;

    const row = document.createElement('div');
    row.className = [
      'msg-row',
      msg.type,
      sameAsPrev ? 'group-continue' : 'group-start'
    ].join(' ');

    const ticks = msg.type === 'sent'
      ? `<span class="ticks">
           <svg viewBox="0 0 16 11" width="14" height="10" fill="#53bdeb">
             <path d="M1 5.5L5 9.5L10 2"/>
             <path d="M5 9.5L14 1" opacity=".6"/>
           </svg>
         </span>`
      : '';

    row.innerHTML = `
      <div class="bubble">
        ${escHtml(msg.text)}
        <div class="bubble-meta">${msg.time}${ticks}</div>
      </div>`;

    messagesArea.appendChild(row);
  });

  scrollToBottom();
}

function scrollToBottom() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ── Switch contact ─────────────────────────────────────────
function switchContact(id) {
  // Clear unread
  const c = CONTACTS.find(c => c.id === id);
  c.unread = 0;

  activeId = id;
  renderSidebar();
  renderHeader(c);
  renderMessages(c.messages);
  messageInput.focus();
}

// ── Send message ───────────────────────────────────────────
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const c = CONTACTS.find(c => c.id === activeId);
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg = { id: Date.now(), type: 'sent', text, time };
  c.messages.push(msg);
  c.lastMsg  = text;
  c.lastTime = time;

  messageInput.value = '';

  // Append bubble directly (fast, no full re-render)
  appendBubble(msg, c.messages.length >= 2 && c.messages[c.messages.length - 2].type === 'sent');
  renderSidebar();
  scrollToBottom();
}

function appendBubble(msg, sameAsPrev) {
  const row = document.createElement('div');
  row.className = [
    'msg-row',
    msg.type,
    sameAsPrev ? 'group-continue' : 'group-start'
  ].join(' ');

  const ticks = `<span class="ticks">
    <svg viewBox="0 0 16 11" width="14" height="10" fill="#53bdeb">
      <path d="M1 5.5L5 9.5L10 2"/>
      <path d="M5 9.5L14 1" opacity=".6"/>
    </svg>
  </span>`;

  row.innerHTML = `
    <div class="bubble">
      ${escHtml(msg.text)}
      <div class="bubble-meta">${msg.time}${ticks}</div>
    </div>`;

  messagesArea.appendChild(row);
}

// ── Emoji picker ───────────────────────────────────────────
function buildEmojiPicker() {
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      insertEmoji(emoji);
    });
    emojiPicker.appendChild(btn);
  });
}

function insertEmoji(emoji) {
  const input = messageInput;
  const start = input.selectionStart;
  const end   = input.selectionEnd;
  input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
  input.setSelectionRange(start + emoji.length, start + emoji.length);
  input.focus();
  closeEmojiPicker();
}

function closeEmojiPicker() {
  emojiPicker.classList.remove('open');
}

emojiToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiToggle) {
    closeEmojiPicker();
  }
});

// ── Input events ───────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Helpers ────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ───────────────────────────────────────────────────
buildEmojiPicker();
renderSidebar();
switchContact(activeId);
