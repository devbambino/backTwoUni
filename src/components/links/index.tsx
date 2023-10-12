import React from 'react';
import ShowUI from '../wallet-methods/show-ui';
import { useUser } from '../../contexts/UserContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { logout } from '../../utils/logout';

interface Props {
  dark?: boolean;
  footer?: boolean;
}

const Links = ({ dark, footer }: Props) => {

  const { user, setUser } = useUser();
  const { web3, setWeb3 } = useWeb3();

  return (
    <div className={`links ${footer ? 'footer-links' : ''}`}>
      <div className="link">
        <button className="wallet-method" onClick={() => logout(setWeb3, setUser)}>
          Logout
        </button>
      </div>
      <div className="link-divider" style={{ backgroundColor: dark ? '#D46C48' : '#D46C48' }} />
      <div className="link">
        <ShowUI />
      </div>
    </div>
  );
};

export default Links;
