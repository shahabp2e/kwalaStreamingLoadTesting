Contract add Amoy: 0xB9aA7bcaaD765958De9eC4Fc6FF55ca6c5b15C28

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LoadTestingV2 {

    uint256 public x;

    event Set1(uint256 value);
    event Set2(uint256 value);
    event Set3(uint256 value);
    event Set4(uint256 value);
    event Set5(uint256 value);
    event Set6(uint256 value);
    event Set7(uint256 value);
    event Set8(uint256 value);
    event Set9(uint256 value);
    event Set10(uint256 value);

    function set1(uint256 _x) public {
        x = _x;
        emit Set1(_x);
    }

    function set2(uint256 _x) public {
        x = _x;
        emit Set2(_x);
    }

    function set3(uint256 _x) public {
        x = _x;
        emit Set3(_x);
    }

    function set4(uint256 _x) public {
        x = _x;
        emit Set4(_x);
    }

    function set5(uint256 _x) public {
        x = _x;
        emit Set5(_x);
    }

    function set6(uint256 _x) public {
        x = _x;
        emit Set6(_x);
    }

    function set7(uint256 _x) public {
        x = _x;
        emit Set7(_x);
    }

    function set8(uint256 _x) public {
        x = _x;
        emit Set8(_x);
    }

    function set9(uint256 _x) public {
        x = _x;
        emit Set9(_x);
    }

    function set10(uint256 _x) public {
        x = _x;
        emit Set10(_x);
    }
}