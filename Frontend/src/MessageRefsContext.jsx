import React, { createContext, useRef, useContext } from "react";

const MessageRefsContext = createContext();

export const useMessageRefs = () => useContext(MessageRefsContext);

export const MessageRefsProvider = ({ children }) => {
	const messageRefs = useRef({});

	const setRef = (messageId, ref) => {
		messageRefs.current[messageId] = ref;
	};

	return (
		<MessageRefsContext.Provider value={{ messageRefs, setRef }}>
			{children}
		</MessageRefsContext.Provider>
	);
};
