import React, { useState } from 'react';
import CreateChannel from './CreateChannel';
import YourChannels from './YourChannels';
import SubscribedChannels from './SubscribedChannels';
import AllChannels from './AllChannels';

const ChannelsPage = () => {
	const [subscribedChannels, setSubscribedChannels] = useState([]);
	const [yourChannels, setYourChannels] = useState([]);
	const [allChannels, setAllChannels] = useState([]);

	return (
		<div
			className='container mt-3'
			style={{ marginBottom: '30px' }}
		>
			<CreateChannel
				subscribedChannels={subscribedChannels}
				setSubscribedChannels={setSubscribedChannels}
				yourChannels={yourChannels}
				setYourChannels={setYourChannels}
			/>
			<YourChannels
				yourChannels={yourChannels}
				setYourChannels={setYourChannels}
				setSubscribedChannels={setSubscribedChannels}
				setAllChannels={setAllChannels}
			/>
			<SubscribedChannels
				subscribedChannels={subscribedChannels}
				setSubscribedChannels={setSubscribedChannels}
				setAllChannels={setAllChannels}
			/>
			<AllChannels
				subscribedChannels={subscribedChannels}
				setSubscribedChannels={setSubscribedChannels}
				allChannels={allChannels}
				setAllChannels={setAllChannels}
			/>
		</div>
	);
};

export default ChannelsPage;
