/**
 * Returns the name of the other user in a 1-on-1 chat
 */
export const getSender = (loggedUser, users) => {
  if (!users || users.length < 2 || !loggedUser) return "";
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

/**
 * Returns the full User object of the other user in a 1-on-1 chat
 */
export const getSenderFull = (loggedUser, users) => {
  if (!users || users.length < 2 || !loggedUser) return {};
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

/**
 * Checks if the next message is from a different sender or undefined (for showing avatar)
 */
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

/**
 * Checks if this is the last message in the list from another sender
 */
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

/**
 * Calculates margin/alignment for message bubbles based on sender
 */
export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 36;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

/**
 * Checks if current message has the same sender as previous message (for tighter grouping)
 */
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
