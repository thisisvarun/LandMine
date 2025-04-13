// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract LandRegistry {
    address payable public govtAddress;

    constructor() {
        owner = msg.sender;
        govtAddress = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266); // Hardhat Account #0
    }

    enum ReqStatus { Default, Pending, Rejected, Approved }
    enum Availability { Available, Pending, NotAvailable }
    enum ApprovalStatus { NotApproved, Approved, NotYetApproved }

    struct User {
        uint256[] assetList;
        address userid;
        string uname;
        uint256 ucontact;
        string uemail;
        uint256 upostalCode;
        string city;
        bool exist;
    }

    struct LandDetails {
        address payable id;
        string ipfsHash;
        string laddress;
        uint256 lamount;
        uint256 key;
        ApprovalStatus isGovtApproved;
        Availability isAvailable;
        address requester;
        ReqStatus requestStatus;
        string doc1Hash;
        string doc2Hash;
    }

    address[] public userArr;
    uint256[] public assets;
    address public owner;
    
    mapping(address => User) public users;
    mapping(address => uint256[]) public userAssets;
    mapping(uint256 => LandDetails) public lands;

    event LandRegistered(uint256 key, address owner);

    modifier restricted() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addUser(
        address uid,
        string memory _uname,
        uint256 _ucontact,
        string memory _uemail,
        uint256 _ucode,
        string memory _ucity
    ) public returns (bool) {
        require(!users[uid].exist, "User already exists");
        users[uid] = User(
            new uint256[](0),
            uid,
            _uname,
            _ucontact,
            _uemail,
            _ucode,
            _ucity,
            true
        );
        userArr.push(uid);
        return true;
    }

    function getFullLandDetails(uint256 id) public view returns (LandDetails memory) {
        return lands[id];
    }

    function getUser(address uid)
        public
        view
        returns (
            address,
            string memory,
            uint256,
            string memory,
            uint256,
            string memory,
            bool
        )
    {
        require(users[uid].exist, "User does not exist");
        return (
            users[uid].userid,
            users[uid].uname,
            users[uid].ucontact,
            users[uid].uemail,
            users[uid].upostalCode,
            users[uid].city,
            users[uid].exist
        );
    }

    function registerLand(
        address payable _id,
        string memory _ipfsHash,
        string memory _laddress,
        uint256 _lamount,
        uint256 _key,
        ApprovalStatus status,
        Availability _isAvailable,
        string memory _doc1Hash,
        string memory _doc2Hash
    ) public returns (bool) {
        require(lands[_key].id == address(0), "Land already registered");
        lands[_key] = LandDetails(
            _id,
            _ipfsHash,
            _laddress,
            _lamount,
            _key,
            status,
            _isAvailable,
            address(0),
            ReqStatus.Default,
            _doc1Hash,
            _doc2Hash
        );
        userAssets[_id].push(_key);
        assets.push(_key);
        users[_id].assetList.push(_key);
        emit LandRegistered(_key, _id);
        return true;
    }

    function computeId(string memory _laddress, string memory _lamount) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_laddress, _lamount))) % 10000000000000;
    }

    function viewAssets() public view returns (uint256[] memory) {
        return users[msg.sender].assetList;
    }

    function getAllAssets() public view returns (uint256[] memory) {
        return assets;
    }

    function getLandInfoOwner(uint256 id)
        public
        view
        returns (
            address payable,
            string memory,
            uint256,
            string memory,
            string memory,
            address,
            ReqStatus
        )
    {
        return (
            lands[id].id,
            lands[id].ipfsHash,
            lands[id].lamount,
            lands[id].isGovtApproved == ApprovalStatus.Approved ? "Approved" : "Not Approved",
            lands[id].isAvailable == Availability.Available ? "Available" : "Not Available",
            lands[id].requester,
            lands[id].requestStatus
        );
    }

    function updateGovtStatus(uint256 _id, ApprovalStatus status, Availability _isAvailable) 
        public 
        restricted 
        returns (bool) 
    {
        require(lands[_id].id != address(0), "Land not registered");
        lands[_id].isGovtApproved = status;
        lands[_id].isAvailable = _isAvailable;
        return true;
    }

    function makeAvailable(uint256 property) public {
        require(lands[property].id == msg.sender, "Not the owner");
        lands[property].isAvailable = Availability.Available;
    }

    function requestLand(uint256 id) public {
        require(lands[id].isAvailable == Availability.Available, "Land not available");
        lands[id].requester = msg.sender;
        lands[id].isAvailable = Availability.Pending;
        lands[id].requestStatus = ReqStatus.Pending;
    }

    function processRequest(uint256 property, ReqStatus status) public {
        require(lands[property].id == msg.sender, "Not the owner");
        require(lands[property].requestStatus == ReqStatus.Pending, "No pending request");
        lands[property].requestStatus = status;
        if (status == ReqStatus.Rejected) {
            lands[property].requester = address(0);
            lands[property].requestStatus = ReqStatus.Default;
            lands[property].isAvailable = Availability.Available;
        } else if (status == ReqStatus.Approved) {
            lands[property].isAvailable = Availability.NotAvailable;
        }
    }

    function calculateStampDuty(uint256 amount) public pure returns (uint256) {
        uint256 stampDutyPercentage = 7;
        return (amount * stampDutyPercentage) / 100;
    }

    function buyProperty(uint256 property) public payable {
        require(lands[property].requestStatus == ReqStatus.Approved, "Request not approved");
        require(msg.value == (lands[property].lamount * 1 ether), "Incorrect payment amount");

        uint256 stampDuty = calculateStampDuty(lands[property].lamount * 1 ether);

        govtAddress.transfer(stampDuty);
        lands[property].id.transfer(msg.value - stampDuty);

        removeOwnership(lands[property].id, property);
        lands[property].id = payable(msg.sender);
        lands[property].isGovtApproved = ApprovalStatus.NotApproved;
        lands[property].isAvailable = Availability.NotAvailable;
        lands[property].requester = address(0);
        lands[property].requestStatus = ReqStatus.Default;
        users[msg.sender].assetList.push(property);
    }

    function removeOwnership(address previousOwner, uint256 id) private {
        uint256 index = findAssetIndex(id, previousOwner);
        require(index < users[previousOwner].assetList.length, "Asset not found");

        for (uint256 i = index; i < users[previousOwner].assetList.length - 1; i++) {
            users[previousOwner].assetList[i] = users[previousOwner].assetList[i + 1];
        }

        users[previousOwner].assetList.pop();
    }

    function findAssetIndex(uint256 id, address userAddress) public view returns (uint256) {
        for (uint256 i = 0; i < users[userAddress].assetList.length; i++) {
            if (users[userAddress].assetList[i] == id) return i;
        }
        revert("Asset not found");
    }

    function getUserAssets(address userAddress) public view returns (uint256[] memory) {
        return users[userAddress].assetList;
    }
}