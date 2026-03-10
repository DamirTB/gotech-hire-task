import React, { Component } from 'react';

interface Props {
  username: string;
  isConnected: boolean;
  onLogout: () => void;
}

interface State {
  status: number;
}

// FLAW: class component in an otherwise functional React codebase
export default class Header extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      status: 1,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isConnected !== this.props.isConnected) {
      // FLAW: magic number - 2 means "connected", 1 means "disconnected"
      this.setState({ status: this.props.isConnected ? 2 : 1 });
    }
  }

  render() {
    const { username, onLogout } = this.props;
    const { status } = this.state;

    return (
      <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{username || 'Loading...'}</div>
        <div style={{ fontSize: '12px', color: status === 2 ? 'green' : 'gray', marginBottom: '8px' }}>
          {status === 2 ? 'Connected' : 'Disconnected'}
        </div>
        <button
          onClick={onLogout}
          style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer', width: '100%' }}
        >
          Logout
        </button>
      </div>
    );
  }
}
