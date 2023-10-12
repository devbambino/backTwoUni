// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Proposal {
    address private owner;
    uint256 id;
    string orgId; 
    address proposalAuthor;
    mapping(address => bool) proposalVoters;
    Info private info;

    struct Info{
        bool isOn; 
        bool passed;
        string proposalName;
        string proposalDesc;
        uint256 proposalVotesCount;
    }

    modifier isNewVoter(address _sender){
        require(!proposalVoters[_sender],"You have already voted for this proposal!");
        _;
    }
    modifier onlyAuthor(address _sender){
        require(proposalAuthor == _sender,"You are not the author of the proposal!");
        _;
    }
    modifier onlyOwner(){
        require( owner == msg.sender,"You are not the contract's owner!");
        _;
    }
    constructor(
        address _owner,
        string memory _orgId,
        uint256 _id,
        string memory _proposalName,
        string memory _proposalDesc,
        address _author
    ){
        owner = _owner;
        orgId = _orgId;
        id = _id;
        info.isOn = true;
        info.proposalName = _proposalName;
        info.proposalDesc = _proposalDesc;
        proposalAuthor = _author;
    }
    function getInfo() view external onlyOwner returns(Info memory _info){
        return info;
    }
    function getProposalVotesCount() view external onlyOwner returns(uint _proposalVotesCount){
        return info.proposalVotesCount;
    }
    function checkIfVoted(address _sender) view onlyOwner external returns(bool _hasVoted){
        return proposalVoters[_sender];
    }
    function setVoter(address _sender) external onlyOwner isNewVoter(_sender){
        proposalVoters[_sender] = true;
        info.proposalVotesCount += 1;
    }
    function executeProposal(uint256 _orgProposalVotesThreshold, address _sender) external onlyOwner onlyAuthor(_sender){
        if(info.proposalVotesCount > _orgProposalVotesThreshold){
            info.passed = true;
        }
        info.isOn = false;
    }
}

contract BackTwoUni {

    enum OrgType {
        none,
        university,
        company,
        city,
        state
    }

    enum UserType {
        none,
        admin,
        funder
    }

    struct User {
        UserType userType;
        string orgId;
        string userName;
        uint256 userBalance;
    }

    struct Org {
        OrgType orgType;
        string orgId;
        string orgName;
        uint256 orgBalance;
        uint256 orgStakersBalance;
        bool allowProposals;
        address payable orgAdmin;
        uint256[] orgProposals;
        address[] orgUsers;
    }

    address private superOwner;
    OrgType private defaultOrgType;
    UserType private defaultUserType;
    bool private allowFundersWithdrawals;
    bool private allowAdminsWithdrawals;
    uint256 public constant adminStakingThreshold = 0.2 ether;
    uint256 public constant fundersStakingThreshold = 0.02 ether;
    mapping(address => User) private users;
    mapping(string => Org) private orgs;
    Proposal[] private proposals;

    modifier onlySuperOwner() {
        require(superOwner == msg.sender, "You are not the Super Owner!");
        _;
    }
    modifier onlyOrgAdmin(string memory _orgId) {
        require(orgs[_orgId].orgAdmin == msg.sender,"You are not the org's admin!");
        _;
    }
    modifier userNotExists() {
        require(users[msg.sender].userType == UserType.none,"User was created already!");
        _;
    }
    modifier userExists() {
        require(users[msg.sender].userType != UserType.none,"User doesn't exist!");
        _;
    }
    modifier isProposalOn(uint256 _proposalId){
        require(proposals[_proposalId].getInfo().isOn,"This proposal is not enabled!");
        _;
    }

    constructor() {
        superOwner = msg.sender;
        defaultOrgType = OrgType.university;
        defaultUserType = UserType.funder;
    }

    function setSuperOwner(address _newSuperOwner) external onlySuperOwner {
        superOwner = _newSuperOwner;
    }
    function setAllowAdminsWithdrawals(bool _newRule) external onlySuperOwner {
        allowAdminsWithdrawals = _newRule;
    }
    function setAllowFundersWithdrawals(bool _newRule) external onlySuperOwner {
        allowFundersWithdrawals = _newRule;
    }
    function setOrgAdmin(
        string memory _orgId,
        string memory _userName,
        bool _allowProposals
    ) external payable userNotExists{
        require(msg.value >= adminStakingThreshold,"For creating an admin user you need to send 0.2 tokens. It's just a one time thing!");
        Org storage _org = orgs[_orgId];
        if (_org.orgType == OrgType.none) {
            _org.orgType = defaultOrgType;
            _org.orgId = _orgId;
            _org.orgName = _orgId;
        }
        require(_org.orgAdmin == address(0),"There is an admin user already!");
        users[msg.sender] = User(UserType.admin, _orgId, _userName, 0);
        _org.orgAdmin = payable(msg.sender);
        _org.orgBalance = msg.value;
        _org.allowProposals = _allowProposals;
    }

    function setUser(string memory _orgId, string memory _userName)
        external
        userNotExists
    {
        Org storage _org = orgs[_orgId];
        if (_org.orgType == OrgType.none) {
            _org.orgType = defaultOrgType;
            _org.orgId = _orgId;
            _org.orgName = _orgId;
        }
        users[msg.sender] = User(defaultUserType, _orgId, _userName, 0);
        _org.orgUsers.push(msg.sender);
    }
    function setOrgAllowProposal(
        string memory _orgId,
        bool _allowProposals
    ) external onlyOrgAdmin(_orgId) {
        orgs[_orgId].allowProposals = _allowProposals;
    }
    function setProposal(
        string memory _proposalName,
        string memory _proposalDesc
    ) external userExists{
        string memory _orgId = users[msg.sender].orgId;
        require(orgs[_orgId].allowProposals,"Organization does NOT allowed proposals creation!");
        require(users[msg.sender].userBalance >= fundersStakingThreshold,"For making proposals you need to stake 0.02 tokens. It's just a one time thing!");
        uint256 _proposalId = proposals.length;
        Proposal _proposal = new Proposal(address(this),_orgId,_proposalId,_proposalName,_proposalDesc,msg.sender);
        proposals.push( _proposal);
        orgs[_orgId].orgProposals.push(_proposalId);
    }
    function getProposalInfo(uint256 _proposalId)
        external
        view
        userExists
        returns (Proposal.Info memory _proposalInfo)
    {
        return proposals[_proposalId].getInfo();
    }
    
    function checkIfVoted(uint256 _proposalId)
        external
        view
        userExists
        returns (bool _hasVoted)
    {
        Proposal _proposal = proposals[_proposalId];
        return _proposal.checkIfVoted(msg.sender);
    }
    function getOrgProposals()
        external
        view
        userExists
        returns (uint256[] memory _orgProposals)
    {
        return orgs[users[msg.sender].orgId].orgProposals;
    }
    function voteProposal(uint256 _proposalId) external userExists isProposalOn(_proposalId){
        proposals[_proposalId].setVoter(msg.sender);
    }
    function executeProposal(uint256 _proposalId) external userExists isProposalOn(_proposalId){
        proposals[_proposalId].executeProposal(getOrgUsersCount()/2,msg.sender);
    }

    function stakeFundsFunder()
        external
        payable
        userExists
    {
        require(msg.value >= fundersStakingThreshold,"You need to send 0.02 tokens or more. It's just a one time thing!");
        users[msg.sender].userBalance += msg.value;
        orgs[users[msg.sender].orgId].orgStakersBalance += msg.value;
    }

    function getUserInfo()
        external
        view
        userExists
        returns (User memory _userInfo)
    {
        return users[msg.sender];
    }

    function getOrgInfo() external view userExists returns (Org memory _orgInfo) {
        return orgs[users[msg.sender].orgId];
    }

    function getSuperOwner() external view onlySuperOwner returns (address _address) {
        return superOwner;
    }

    function getOrgUsersCount()
        public
        view
        userExists
        returns (uint256 _usersCount)
    {
        return orgs[users[msg.sender].orgId].orgUsers.length;
    }

    function getOrgProposalsCount()
        external
        view
        userExists
        returns (uint256 _proposalsCount)
    {
        return orgs[users[msg.sender].orgId].orgProposals.length;
    }
    function refundOrgStaker() external payable userExists{
        require(allowFundersWithdrawals,"Stakers/Funders withdrawals are not allowed yet!");
        require(users[msg.sender].userBalance > 0,"You don't have a balance here!");
        uint _amount = users[msg.sender].userBalance;
		(bool success, ) = payable(msg.sender).call{value: _amount}("");
		require(success,"Failed to withdraw ether!");
        users[msg.sender].userBalance = 0;
        orgs[users[msg.sender].orgId].orgStakersBalance -= _amount;
    }
    function sendOrgBalanceToOrgAdmin(string memory _orgId) external payable onlyOrgAdmin(_orgId){
        require(allowAdminsWithdrawals,"Orgs withdrawals are not allowed yet!");
        address payable _orgAdmin = orgs[_orgId].orgAdmin;
        uint _amount = orgs[_orgId].orgBalance;
		(bool success, ) = _orgAdmin.call{value: _amount}("");
		require(success,"Failed to withdraw ether!");
        orgs[_orgId].orgBalance = 0;
    }
}