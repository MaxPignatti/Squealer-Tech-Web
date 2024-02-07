import React, { createContext, useRef, useContext, useMemo } from "react";
import PropTypes from "prop-types";

const MessageRefsContext = createContext();

export const useMessageRefs = () => useContext(MessageRefsContext);

export const MessageRefsProvider = ({ children }) => {
	const messageRefs = useRef({});

	const setRef = (messageId, ref) => {
		messageRefs.current[messageId] = ref;
	};

	const value = useMemo(() => ({ messageRefs, setRef }), []);

	return (
		<MessageRefsContext.Provider value={value}>
			{children}
		</MessageRefsContext.Provider>
	);
};

MessageRefsProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
