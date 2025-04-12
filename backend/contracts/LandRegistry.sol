// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ✅ Updated government wallet address
address payable constant govtAddress = payable(0x4335BdD13cB56abf4542b841a0e7ca9fb7f4CBFc);

contract LandRegistry {
    struct Task {
        uint256 id;
        string content;
        bool completed;
    }
    struct user {
        address userid;
        string uname;
        uint256 ucontact;
        string uemail;
        uint256 upostalCode;
        string city;
        bool exist;
    }
    struct landDetails {
        address payable id;
        string ipfsHash;
        string laddress;
        uint256 lamount;
        uint256 key;
        string isGovtApproved;
        string isAvailable;
        address requester;
        reqStatus requestStatus;
        string doc1Hash;
        string doc2Hash;
    }

    address[] userarr;
    uint256[] assets;
    address owner;
    enum reqStatus {Default, Pending, Rejected, Approved}

    constructor() {
        owner = msg.sender;
    }

    struct profiles {
        uint256[] assetList;
    }

    mapping(address => profiles) profile;
    mapping(address => user) public users;
    mapping(uint256 => landDetails) public land;

    function addUser(
        address uid,
        string memory _uname,
        uint256 _ucontact,
        string memory _uemail,
        uint256 _ucode,
        string memory _ucity
    ) public returns (bool) {
        users[uid] = user(
            uid,
            _uname,
            _ucontact,
            _uemail,
            _ucode,
            _ucity,
            true
        );
        userarr.push(uid);
        return true;
    }

    function getFullLandDetails(uint256 id) public view returns (LandDetails memory) {
        return land[id];
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
        if (users[uid].exist)
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

    function Registration(
    address payable _id,
    string memory _ipfsHash,
    string memory _laddress,
    uint256 _lamount,
    uint256 _key,
    string memory status,
    string memory _isAvailable,
    string memory _doc1Hash,
    string memory _doc2Hash
    ) public returns (bool) {
        land[_key] = LandDetails(
            _id,
            _ipfsHash,
            _laddress,
            _lamount,
            _key,
            status,
            _isAvailable,
            address(0),
            reqStatus.Default,
            _doc1Hash,
            _doc2Hash
        );
        userAssets[_id].push(_key);
        assets.push(_key);
        emit LandRegistered(_key, _id);
        return true;
    }


    function computeId(string memory _laddress, string memory _lamount)
        public
        view
        returns (uint256)
    {
        return
            uint256(keccak256(abi.encodePacked(_laddress, _lamount))) % 10000000000000;
    }

    function viewAssets() public view returns (uint256[] memory) {
        return (profile[msg.sender].assetList);
    }

    function Assets() public view returns (uint256[] memory) {
        return assets;
    }

    function landInfoOwner(uint256 id)
        public
        view
        returns (
            address payable,
            string memory,
            uint256,
            string memory,
            string memory,
            address,
            reqStatus
        )
    {
        return (
            land[id].id,
            land[id].ipfsHash,
            land[id].lamount,
            land[id].isGovtApproved,
            land[id].isAvailable,
            land[id].requester,
            land[id].requestStatus
        );
    }

    function govtStatus(
        uint256 _id,
        string memory status,
        string memory _isAvailable
    ) public returns (bool) {
        land[_id].isGovtApproved = status;
        land[_id].isAvailable = _isAvailable;
        return true;
    }

    function makeAvailable(uint256 property) public {
        require(land[property].id == msg.sender);
        land[property].isAvailable = "Available";
    }

    function requstToLandOwner(uint256 id) public {
        land[id].requester = msg.sender;
        land[id].isAvailable = "Pending";
        land[id].requestStatus = reqStatus.Pending;
    }

    function processRequest(uint256 property, reqStatus status) public {
        require(land[property].id == msg.sender);
        land[property].requestStatus = status;
        land[property].isAvailable = "Approved";
        if (status == reqStatus.Rejected) {
            land[property].requester = address(0);
            land[property].requestStatus = reqStatus.Default;
            land[property].isAvailable = "Available";
        }
    }

    function calculateStampDuty(uint256 amount) public pure returns (uint256) {
        uint256 stampDutyPercentage = 7; // ✅ 7% stamp duty
        return (amount * stampDutyPercentage) / 100;
    }

    function buyProperty(uint256 property) public payable {
        require(land[property].requestStatus == reqStatus.Approved);
        require(msg.value == (land[property].lamount * 1 ether));

        uint256 stampDuty = calculateStampDuty(land[property].lamount * 1 ether);
        
        govtAddress.transfer(stampDuty);
        land[property].id.transfer(msg.value - stampDuty);

        removeOwnership(land[property].id, property);
        land[property].id = payable(msg.sender);
        land[property].isGovtApproved = "Not Approved";
        land[property].isAvailable = "Not yet approved by the govt.";
        land[property].requester = address(0);
        land[property].requestStatus = reqStatus.Default;
        profile[msg.sender].assetList.push(property);
    }

    function removeOwnership(address previousOwner, uint256 id) private {
        uint256 index = findId(id, previousOwner);
        
        for (uint256 i = index; i < profile[previousOwner].assetList.length - 1; i++) {
            profile[previousOwner].assetList[i] = profile[previousOwner].assetList[i + 1];
        }
        
        profile[previousOwner].assetList.pop();
    }

    function findId(uint256 id, address userAddress) public view returns (uint256) {
        uint256 i;
        for (i = 0; i < profile[userAddress].assetList.length; i++) {
            if (profile[userAddress].assetList[i] == id) return i;
        }
        return i;
    }
}
