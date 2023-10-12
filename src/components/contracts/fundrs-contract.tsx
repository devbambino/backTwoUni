import React, { useEffect, useState } from 'react';
import CardHeader from '../ui/card-header';
import Divider from '../ui/divider';
import FormButton from '../ui/form-button';
import FormInput from '../ui/form-input';
import CardLabel from '../ui/card-label';
import ErrorText from '../ui/error';
import { getBackUniContractAddress } from '../../utils/contracts';
import { backuniContractAbi } from '../../utils/contract-abis';
import { useUser } from '../../contexts/UserContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { magic } from '../../libs/magic';
import Toast from '../ui/toast';
import Spacer from '../ui/spacer';

const FundrsContract = () => {
  const toastTime = 8000;
  const { user } = useUser();
  const { web3 } = useWeb3();
  const [balance, setBalance] = useState('...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  //const [newNumber, setNewNumber] = useState('');
  //const [storedNumber, setStoredNumber] = useState('');
  const [newUser, setNewUser] = useState('');
  const [storedSuperowner, setStoredSuperowner] = useState([]);
  const [newEmail, setNewEmail] = useState('');

  const [newProposalName, setNewProposalName] = useState('');
  const [newProposalDesc, setNewProposalDesc] = useState('');
  const [storedProposal, setStoredProposal] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [selectedProposalVoted, setSelectedProposalVoted] = useState(false);
  const [selectedProposalIsOn, setSelectedProposalIsOn] = useState(true);
  const [votedProposalError, setVotedProposalError] = useState(false);
  const [isOnProposalError, setIsOnProposalError] = useState(false);
  const [proposalsIds, setProposalsIds] = useState<number[]>([]);

  const [disabled, setDisabled] = useState(!newUser);
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [newUserError, setNewUserError] = useState(true);
  const [exceptions, setExceptions] = useState('');

  const [email, setEmail] = useState<string | undefined>('');
  //const [orgId, setOrgId] = useState<string | undefined>('');
  const [orgId, setOrgId] = useState('');
  //const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);

  type Proposal = {
    isOn: boolean,
    passed: boolean,
    proposalName: string,
    proposalDesc: string,
    proposalVotesCount: number,
  }
  type User = {
    isOn: boolean,
    userType: number,
    orgId: string,
    userName: string,
    userBalance: number,
  }
  type Org = {
    allowProposals: boolean,
    orgType: number,
    orgId: string,
    orgName: string,
    orgBalance: number,
    orgStakersBalance: number,
    orgAdmin: string,
    orgProposals: number[],
    orgUsers: string[]
  }

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [storedUser, setStoredUser] = useState<User>();
  const [storedOrg, setStoredOrg] = useState<Org>();
  //const [storedUser, setStoredUser] = useState([]);
  //const [storedOrg, setStoredOrg] = useState<any[]>([]);

  //let proposals: any[] = [];
  const getBalance = async () => {
    if (user && web3) {
      try {
        if (isAdmin) {
          const waletBalance = await web3.eth.getBalance(user);
          const waletBalanceFromWei = web3.utils.fromWei(waletBalance);
          console.log('getBalance balance:', waletBalanceFromWei);
          setBalance(waletBalanceFromWei);
          if (Number(waletBalanceFromWei) > 0.2) {
            createUser();
          } else {
            setDisabled(false);
            setExceptions('You need to have more than 0.2 tokens in your wallet before trying to create a Admin user!!!');
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
            }, toastTime);
          }
        } else {
          createUser();
        }

      } catch (error) {
        console.error('getBalance error:', error);
        return balance;
      }
    }
  };

  const requestUserInfo = async () => {
    try {
      setDisabled(true);
      const userInfo = await magic.wallet.requestUserInfoWithUI({
        scope: {
          email: 'optional',
        },
      });
      setDisabled(false);
      setEmail(userInfo.email);
      console.log('requestUserInfo userInfo:', userInfo);
      var emailArray = userInfo.email?.split('@') || ['user', 'email.edu'];
      setOrgId(emailArray[1]);
      if (emailArray[0] == 'b2u.admin') {
        //setIsAdmin(true);
        return setIsAdmin(true);
      } else {
        //setIsAdmin(false);
        return setIsAdmin(false);
      }
    } catch (error) {
      setDisabled(false);
      console.error(error);
      console.log('requestUserInfo error:', error);
      setExceptions('Error getting your email!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };

  const changeUserOrgEmail = async () => {
    setEmail(newEmail);
    console.log('changeUserOrgEmail email from newEmail:', newEmail);
    var emailArray = newEmail?.split('@') || ['user', 'email.edu'];
    setOrgId(emailArray[1]);
    if (emailArray[0] == 'b2u.admin') {
      console.log('changeUserOrgEmail isadmin true, emailArray[0]:', emailArray[0]);
      return setIsAdmin(true);
    } else {
      console.log('changeUserOrgEmail isadmin false, emailArray[0]:', emailArray[0]);
      return setIsAdmin(false);
    }
  };

  const getStoredSuperowner = async () => {
    try {
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      const superownerInfo = await contract.methods.getSuperOwner().call({ from: user });
      setStoredSuperowner(superownerInfo);
      console.log('getStoredSuperowner superownerInfo:', superownerInfo);
    } catch (error) {
      console.error(error);
      console.log('getStoredSuperowner error:', error);
      setExceptions('Error getting the Org info!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };

  const getStoredUser = async () => {
    try {
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      const userInfo = await contract.methods.getUserInfo().call({ from: user });
      setStoredUser(userInfo);
      setNewUserError(false);
      getStoredOrg();
      console.log('getStoredUser userInfo:', userInfo);
    } catch (error) {
      console.error(error);
      console.log('getStoredUser error:', error);
      setExceptions('You need to create a User first!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };
  const getStoredOrg = async () => {
    try {
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      const orgInfo = await contract.methods.getOrgInfo().call({ from: user });
      setStoredOrg(orgInfo);
      setOrgId(orgInfo.orgId);
      console.log('getStoredOrg orgInfo:', orgInfo);
      //getBalance();
      //getProposals();
    } catch (error) {
      console.error(error);
      console.log('getStoredOrg error:', error);
      setExceptions('Error getting the Org info!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };
  const getStoredProposal = async () => {
    try {
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      const proposalInfo = await contract.methods.getProposalInfo(selectedProposalId).call({ from: user });
      setStoredProposal(proposalInfo);
      //setSelectedProposalVoted(storedProposal[0]);
      //if(selectedProposalVoted) setVotedProposalError(true);
      setSelectedProposalIsOn(storedProposal[0]);
      if (!selectedProposalIsOn) setIsOnProposalError(true);
      console.log('getStoredProposal proposalInfo:', proposalInfo);
    } catch (error) {
      console.error(error);
      console.log('getStoredProposal error:', error);
      setExceptions('Error getting the Proposal info!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };
  const getProposals = async () => {
    try {
      console.log('getProposals starting fetching');
      let proposalsArray: Proposal[] = [];
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      let proposalsIdsArray: number[] = storedOrg!.orgProposals;
      setProposalsIds(proposalsIdsArray);
      console.log('getProposals proposalsIdsArray:', proposalsIdsArray);
      for (const id of proposalsIdsArray) {
        const proposalInfo: Proposal = await contract.methods.getProposalInfo(id).call({ from: user });
        proposalsArray.push(proposalInfo);
      }
      console.log('getProposals proposalsArray:', proposalsArray);
      //proposals = proposalsArray;
      if (proposalsArray.length > 0) {
        return setProposals(proposalsArray);
      } else {
        setExceptions('There is no proposals in this university yet!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      }

    } catch (error) {
      console.error(error);
      console.log('getProposals error:', error);
      setExceptions('Error getting the list of proposals!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };



  useEffect(() => {
    //setDisabled(!newUser);
    //setNewUserError(false);
  }, [newUser]);

  const setSuperowner = () => {
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .setSuperOwner('')
      .send({ from: user })
      .on('transactionHash', (hash: string) => {
        console.log('setSuperowner Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        getStoredSuperowner();
        console.log('setSuperowner Transaction receipt:', receipt);
        console.log('setSuperowner Transaction storedUser:', storedSuperowner);
      })
      .catch((error: any) => {
        console.log('setSuperowner Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error creating the superowner!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });
  };

  const createProposal = () => {
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .setProposal(newProposalName, newProposalDesc)
      .send({ from: user })
      .on('transactionHash', (hash: string) => {
        console.log('createProposal Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        getStoredOrg();
        getProposals();
        console.log('createProposal Transaction receipt:', receipt);
        console.log('createProposal Transaction storedProposal:', storedProposal);
      })
      .catch((error: any) => {
        console.log('createProposal Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error creating the proposal!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });
  };
  const getSelectedProposalVoted = async (propId: number) => {
    try {
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      const proposalVotedInfo: boolean = await contract.methods.checkIfVoted(propId).call({ from: user });
      //setSelectedProposalVoted(proposalVotedInfo);
      console.log('getSelectedProposalVoted proposalVotedInfo:', proposalVotedInfo);
      //setSelectedProposalVoted(proposalVotedInfo);
      if (proposalVotedInfo) {
        console.log('getSelectedProposalVoted You have already voted the Proposal');
        setExceptions('You have already voted the Proposal!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
        return false;
      } else {
        voteProposal(propId);
      }
    } catch (error) {
      console.error(error);
      console.log('getSelectedProposalVoted error:', error);
      setExceptions('Error checking if you voted the Proposal!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }
  };
  const voteProposal = (propId: number) => {
    //if (!selectedProposalIsOn) return setIsOnProposalError(true);
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .voteProposal(propId)
      .send({ from: user })
      .on('transactionHash', (hash: string) => {
        console.log('voteProposal Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        //getStoredProposal();
        getProposals();
        console.log('voteProposal Transaction receipt:', receipt);
        console.log('voteProposal Transaction storedProposal:', storedProposal);
      })
      .catch((error: any) => {
        console.log('voteProposal Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error voting the proposal!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });
  };
  const executeProposal = (propId: number) => {
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .executeProposal(propId)
      .send({ from: user })
      .on('transactionHash', (hash: string) => {
        console.log('executeProposal Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        getProposals();
        console.log('executeProposal Transaction receipt:', receipt);
        console.log('executeProposal Transaction storedProposal:', storedProposal);
      })
      .catch((error: any) => {
        console.log('executeProposal Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error executing the proposal: remember just the author of the proposal could execute it!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });
  };

  const createUser = () => {
    console.log('createUser orgId:', orgId, ' ,newUser:', newUser);
    //return setNewUserError(true);
    //if (!newUser) return setNewUserError(true);
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    if (isAdmin) {
      contract.methods
        .setOrgAdmin(orgId, newUser, true)
        .send({ from: user, value: web3.utils.toWei('0.2') })
        .on('transactionHash', (hash: string) => {
          console.log('createUserAdmin Transaction hash:', hash);
        })
        .then((receipt: any) => {
          setNewUser('');
          setDisabled(false);
          getStoredUser();
          //getStoredOrg();
          console.log('createUserAdmin Transaction receipt:', receipt);
          //console.log('createUser Transaction storedUser:', storedUser);
        })
        .catch((error: any) => {
          console.log('createUser Transaction error:', error);
          console.error(error);
          setDisabled(false);
          setExceptions('Error creating the user!');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, toastTime);
        });
    } else {
      contract.methods
        .setUser(orgId, newUser)
        .send({ from: user })
        .on('transactionHash', (hash: string) => {
          console.log('createUser Transaction hash:', hash);
        })
        .then((receipt: any) => {
          setNewUser('');
          setDisabled(false);
          getStoredUser();
          //getStoredOrg();
          console.log('createUser Transaction receipt:', receipt);
          //console.log('createUser Transaction storedUser:', storedUser);
        })
        .catch((error: any) => {
          console.log('createUser Transaction error:', error);
          console.error(error);
          setDisabled(false);
          setExceptions('Error creating the user!');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, toastTime);
        });

    }
  };
  const stakeFunds = () => {
    console.log('stakeFunds orgId:', orgId, ' ,newUser:', storedUser?.userName);
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .stakeFundsFunder()
      .send({ from: user, value: web3.utils.toWei('0.02') })
      .on('transactionHash', (hash: string) => {
        console.log('stakeFunds Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        getStoredUser();
        console.log('stakeFunds Transaction receipt:', receipt);
      })
      .catch((error: any) => {
        console.log('stakeFunds Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error staking funds!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });

  };
  const refundStaker = () => {
    setDisabled(true);
    const contractAddress = getBackUniContractAddress();
    const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
    contract.methods
      .refundOrgStaker()
      .send({ from: user })
      .on('transactionHash', (hash: string) => {
        console.log('refundStaker Transaction hash:', hash);
      })
      .then((receipt: any) => {
        setDisabled(false);
        getStoredUser();
        console.log('refundStaker Transaction receipt:', receipt);
        console.log('refundStaker Transaction storedProposal:', storedProposal);
      })
      .catch((error: any) => {
        console.log('refundStaker Transaction error:', error);
        console.error(error);
        setDisabled(false);
        setExceptions('Error refunding user!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, toastTime);
      });
  };
  const refundAdmin = () => {
    if (user == storedOrg?.orgAdmin) {
      console.log('You are the Admin of this Uni!!! orgId:',storedOrg?.orgId);
      setDisabled(true);
      const contractAddress = getBackUniContractAddress();
      const contract = new web3.eth.Contract(backuniContractAbi, contractAddress);
      contract.methods
        .sendOrgBalanceToOrgAdmin(storedOrg?.orgId)
        .send({ from: user })
        .on('transactionHash', (hash: string) => {
          console.log('refundAdmin Transaction hash:', hash);
        })
        .then((receipt: any) => {
          setDisabled(false);
          getStoredUser();
          console.log('refundAdmin Transaction receipt:', receipt);
          console.log('refundAdmin Transaction storedProposal:', storedProposal);
        })
        .catch((error: any) => {
          console.log('refundAdmin Transaction error:', error);
          console.error(error);
          setDisabled(false);
          setExceptions('Error refunding Admin!');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, toastTime);
        });

    } else {
      setExceptions('You are not the Admin of this Uni!!!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, toastTime);
    }

  };


  useEffect(() => {
    if (!web3) return;
    setNewUserError(true);
    requestUserInfo();
    getStoredUser();
    //setProposals([]);
  }, [web3]);

  /*<button className="wallet-method" onClick={requestUserInfo} disabled={disabledBtn} hidden={orgId.length > 0}>
  {disabledBtn ? (
    <div className="loadingContainer" style={{ width: '220px' }}>
      <img className="loading" alt="loading" src={Loading} />
    </div>
  ) : (
    'requestUserInfoWithUI()'
  )}
</button>

<FormButton onClick={voteProposal} disabled={newUserError || votedProposalError || isOnProposalError}>
        Vote For this
      </FormButton>



      <CardHeader id="proposal-info">Proposal Info</CardHeader>
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      <FormInput value={selectedProposalId} onChange={(e: any) => setSelectedProposalId(e.target.value)} placeholder="Write the proposal's id" />
      <center><button className="wallet-method" onClick={getStoredProposal} disabled={newUserError}>
        Get Proposal Info
      </button></center>
      <Spacer size={5} />
      <CardLabel leftHeader="Open to Votes?" />
      <div className="code">{storedProposal[0]}</div>
      <CardLabel leftHeader="Has Passed?" />
      <div className="code">{storedProposal[1]}</div>
      <CardLabel leftHeader="Name" />
      <div className="code">{storedProposal[2]}</div>
      <CardLabel leftHeader="Description" />
      <div className="code">{storedProposal[3]}</div>
      <CardLabel leftHeader="# Votes" />
      <div className="code">{storedProposal[4]}</div>
      <Divider />

      <center><button className="wallet-method" onClick={getStoredSuperowner}>
        Get Super Owner
      </button></center>
      <Spacer size={5} />
      <CardLabel leftHeader="Super Owner" />
      <div className="code">{storedSuperowner}</div>
      <Divider />

      <CardHeader id="proposal-vote">Vote Proposal</CardHeader>
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      {votedProposalError ? <ErrorText>You have already voted for this proposal!</ErrorText> : null}
      {isOnProposalError ? <ErrorText>This proposal is closed already!</ErrorText> : null}
      <FormInput value={selectedProposalId} onChange={(e: any) => setSelectedProposalId(e.target.value)} placeholder="Proposal id here..." />

      <Divider />
      <CardHeader id="proposal-execute">Execute Proposal</CardHeader>
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      {isOnProposalError ? <ErrorText>This proposal is closed already!</ErrorText> : null}
      <FormButton onClick={executeProposal} disabled={newUserError || votedProposalError || isOnProposalError}>
        Execute It Now
      </FormButton>
      <Divider />
*/

  return (
    <div className="wallet-method-container">
      <CardHeader id="testing">For Testing</CardHeader>
      <FormInput value={newEmail} onChange={(e: any) => setNewEmail(e.target.value)} placeholder="New uni email for testing" />
      <ErrorText>Change the email here to simulate you did login using a @university.edu email, for testing admin use b2u.admin@university.edu</ErrorText>
      <FormButton onClick={changeUserOrgEmail} disabled={!newEmail}>
        Change Uni Email
      </FormButton>
      <Divider />
      <CardHeader id="welcome">Welcome To Back2Uni!</CardHeader>
      <CardLabel leftHeader="Your Email" />
      <div className="code">{email}</div>
      <CardLabel leftHeader="Your Uni Id" />
      <div className="code">{orgId}</div>
      <Divider />
      <CardHeader id="new-user">New User</CardHeader>
      <CardLabel leftHeader="Create a new user" />
      {!newUserError ? <ErrorText>You have created an user already!</ErrorText> : null}
      {isAdmin && newUserError ? <ErrorText>For security purposes you will send 0.2 tokens to your university when creating an admin user, so check your balance in the Wallet section of this page before creating a user. It's just a one time thing!</ErrorText> : null}
      <FormInput value={newUser} onChange={(e: any) => setNewUser(e.target.value)} placeholder="New user alias" />
      <FormButton onClick={getBalance} disabled={disabled || !newUserError}>
        Create User
      </FormButton>
      <Divider />
      <CardHeader id="user-info">User Info</CardHeader>
      {newUserError ? <ErrorText>You have to create a user first</ErrorText> : null}
      <center><button className="wallet-method" onClick={getStoredUser} disabled={newUserError}>
        Get Your User Info
      </button></center>
      <Spacer size={5} />
      <CardLabel leftHeader="Type" />
      <div className="code">{newUserError ? '' : storedUser?.userType == 1 ? (
        'Admin'
      ) : (
        'Funder'
      )}</div>
      <CardLabel leftHeader="Uni ID" />
      <div className="code">{storedUser?.orgId}</div>
      <CardLabel leftHeader="Name" />
      <div className="code">{storedUser?.userName}</div>
      <CardLabel leftHeader="Balance" />
      <div className="code">{storedUser?.userBalance ? web3.utils.fromWei(storedUser?.userBalance) : '0'} tokens</div>
      <Divider />
      <CardHeader id="uni-info">Uni Info</CardHeader>
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      <center><button className="wallet-method" onClick={getStoredOrg} disabled={newUserError}>
        Get Uni Info
      </button></center>
      <Spacer size={5} />
      <CardLabel leftHeader="Uni ID" />
      <div className="code">{storedOrg?.orgId}</div>
      <CardLabel leftHeader="Name" />
      <div className="code">{storedOrg?.orgName}</div>
      <CardLabel leftHeader="Uni Balance" />
      <div className="code">{storedOrg?.orgBalance ? (web3.utils.fromWei(storedOrg?.orgBalance)) : ('0')} tokens</div>
      <CardLabel leftHeader="Stakers Balance" />
      <div className="code">{storedOrg?.orgStakersBalance ? (web3.utils.fromWei(storedOrg?.orgStakersBalance)) : ('0')} tokens</div>
      <CardLabel leftHeader="Are proposals allowed?" />
      <div className="code">{newUserError ? '' : storedOrg?.allowProposals ? (
        'Yes'
      ) : (
        'No'
      )}</div>
      <CardLabel leftHeader="Uni Admin" />
      <div className="code">{newUserError ? '' : storedOrg?.orgAdmin && storedOrg?.orgAdmin != '0x0000000000000000000000000000000000000000' ? ('Has an admin') : ('No admin yet')}</div>
      <CardLabel leftHeader="# of Proposals" />
      <div className="code">{storedOrg?.orgProposals.length}</div>
      <CardLabel leftHeader="# of Users" />
      <div className="code">{storedOrg?.orgUsers.length}</div>
      <Divider />
      <CardHeader id="proposal-list">List of Proposals</CardHeader>
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      <center><button className="wallet-method" onClick={getProposals} disabled={newUserError}>
        Get Proposals
      </button></center>
      <Spacer size={15} />
      <div>
        {proposals.map((proposal, idx) => (
          <><table>
            <tbody key={idx}>
              <tr><td><b>Proposal #{idx + 1}: {proposal.proposalName}</b></td></tr>
              <tr><td></td></tr>
              <tr><td>{proposal.proposalDesc}</td></tr>
              <tr><td># votes:{proposal.proposalVotesCount}</td></tr>
              <tr><td><center><b>{proposal.isOn ? null : (proposal.passed ? 'THIS PROPOSAL PASSED' : 'DID NOT PASS')}</b></center></td></tr>
            </tbody>
          </table>
            <Spacer size={5} />
            <FormButton onClick={() => getSelectedProposalVoted(proposalsIds[idx])} disabled={!proposal.isOn}>
              {proposal.isOn ? (
                'Vote For this'
              ) : (
                'Proposal is OFF'
              )}
            </FormButton>
            <Spacer size={10} />
            <CardLabel leftHeader="Are you the author? Then execute the proposal to see if it is approved or not." />
            <FormButton onClick={() => executeProposal(proposalsIds[idx])} disabled={!proposal.isOn}>
              {proposal.isOn ? (
                'Execute Proposal'
              ) : (
                'Proposal is OFF'
              )}
            </FormButton>
            <Spacer size={50} />
          </>

        ))
        }
      </div>
      <Divider />
      <CardHeader id="new-proposal">New Proposal</CardHeader>
      <CardLabel leftHeader="Create a new proposal" />
      <FormInput value={newProposalName} onChange={(e: any) => setNewProposalName(e.target.value)} placeholder="Write the proposal's name" />
      <FormInput value={newProposalDesc} onChange={(e: any) => setNewProposalDesc(e.target.value)} placeholder="Write the proposal's description" />
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      {storedUser?.userBalance && storedUser?.userBalance == 0 ? <ErrorText>For security purposes you need to send 0.02 tokens to your university before starting to make proposals, so check your balance in the Wallet section of this page before clicking the 'Send Tokens' button below. It's just a one time thing!</ErrorText> : null}
      <FormButton onClick={createProposal} disabled={disabled || newUserError || storedUser?.userBalance == 0}>
        Send Proposal
      </FormButton>
      <Spacer size={15} />
      <CardLabel leftHeader="Send Tokens(Staking)" />
      <FormButton onClick={stakeFunds} disabled={disabled || newUserError}>
        Send Tokens
      </FormButton>
      <Divider />
      <CardHeader id="funds-withdraw">Withdraw funds</CardHeader>
      <CardLabel leftHeader="If you are a funder:" />
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      {storedUser?.userBalance == 0 ? <ErrorText>You didn't send tokes to this Uni as a Funder</ErrorText> : null}
      <FormButton onClick={refundStaker} disabled={disabled || newUserError || storedUser?.userBalance == 0}>
        Get Tokens
      </FormButton>
      <Spacer size={15} />
      <CardLabel leftHeader="If you are the Admin:" />
      {newUserError ? <ErrorText>You has to create a user first</ErrorText> : null}
      {storedOrg?.orgBalance == 0 ? <ErrorText>You didn't send tokes to this Uni as an Admin</ErrorText> : null}
      <FormButton onClick={refundAdmin} disabled={disabled || newUserError || storedOrg?.orgBalance == 0}>
        Get Tokens
      </FormButton>

      {showToast ? <Toast>{exceptions}</Toast> : null}
    </div>
  );
};

export default FundrsContract;