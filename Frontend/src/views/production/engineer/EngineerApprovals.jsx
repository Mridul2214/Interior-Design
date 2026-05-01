import React from 'react';
import { CheckSquare } from 'lucide-react';
import LeaveApprovals from '../shared/LeaveApprovals';
import './Engineer.css';

const EngineerApprovals = () => {
    return (
        <div className="eng-dashboard">
            <div className="eng-page-header">
                <div>
                    <h1 className="eng-page-title"><CheckSquare size={22}/> Approvals</h1>
                    <p className="eng-page-sub">Review and approve leave requests from your Site Engineers and Supervisors</p>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <LeaveApprovals />
            </div>
        </div>
    );
};

export default EngineerApprovals;
