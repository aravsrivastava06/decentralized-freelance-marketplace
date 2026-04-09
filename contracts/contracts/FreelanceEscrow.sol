// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FreelanceEscrow {

    struct Job {
        address client;
        address freelancer;
        uint amount;
        bool isFunded;
        bool isCompleted;
    }

    uint public jobCount;
    mapping(uint => Job) public jobs;

    // ✅ CREATE JOB (no freelancer initially)
    function createJob() public returns (uint) {
        jobCount++;
        jobs[jobCount] = Job(msg.sender, address(0), 0, false, false);
        return jobCount;
    }

    // ✅ ASSIGN FREELANCER
    function assignFreelancer(uint _jobId, address _freelancer) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can assign");
        require(job.freelancer == address(0), "Already assigned");

        job.freelancer = _freelancer;
    }

    // ✅ FUND JOB
    function fundJob(uint _jobId) public payable {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can fund");
        require(job.freelancer != address(0), "Freelancer not assigned");
        require(!job.isFunded, "Already funded");

        job.amount = msg.value;
        job.isFunded = true;
    }

    // ✅ RELEASE PAYMENT
    function releasePayment(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can release");
        require(job.isFunded, "Not funded");
        require(!job.isCompleted, "Already completed");

        payable(job.freelancer).transfer(job.amount);

        job.isCompleted = true;
    }
}