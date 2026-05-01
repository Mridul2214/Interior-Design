import React from 'react';
import {
    Target, TrendingUp, Clock, Users, CheckCircle2,
    AlertTriangle, Shield, Milestone, ArrowUp, ArrowDown
} from 'lucide-react';
import '../css/PMAnalytics.css';

const KPIDashboard = ({ kpiData }) => {
    if (!kpiData) return null;

    const {
        onTimeRate = 100,
        completionRate = 0,
        avgProgress = 0,
        totalTasks = 0,
        completedTasks = 0,
        overdueTasks = 0,
        inProgressTasks = 0,
        riskDistribution = {},
        workforce = {},
        milestones = {}
    } = kpiData;

    const kpiCards = [
        {
            label: 'On-Time Delivery',
            value: `${onTimeRate}%`,
            detail: 'Tasks delivered within deadline',
            icon: <Clock size={20} />,
            color: 'green',
            iconBg: '#d1fae5',
            iconColor: '#10b981'
        },
        {
            label: 'Task Completion Rate',
            value: `${completionRate}%`,
            detail: `${completedTasks} of ${totalTasks} tasks completed`,
            icon: <CheckCircle2 size={20} />,
            color: 'blue',
            iconBg: '#dbeafe',
            iconColor: '#3b82f6'
        },
        {
            label: 'Average Progress',
            value: `${avgProgress}%`,
            detail: 'Across all projects',
            icon: <TrendingUp size={20} />,
            color: 'purple',
            iconBg: '#ede9fe',
            iconColor: '#8b5cf6'
        },
        {
            label: 'Overdue Tasks',
            value: overdueTasks,
            detail: 'Require immediate attention',
            icon: <AlertTriangle size={20} />,
            color: overdueTasks > 0 ? 'red' : 'green',
            iconBg: overdueTasks > 0 ? '#fee2e2' : '#d1fae5',
            iconColor: overdueTasks > 0 ? '#ef4444' : '#10b981'
        },
        {
            label: 'In Progress',
            value: inProgressTasks,
            detail: 'Active tasks being worked on',
            icon: <Target size={20} />,
            color: 'blue',
            iconBg: '#dbeafe',
            iconColor: '#3b82f6'
        },
        {
            label: 'Workforce Active',
            value: workforce.active || 0,
            detail: `${workforce.utilization || 0}% utilization of ${workforce.total || 0} team members`,
            icon: <Users size={20} />,
            color: 'amber',
            iconBg: '#fef3c7',
            iconColor: '#f59e0b'
        },
        {
            label: 'Milestones Hit',
            value: `${milestones.completed || 0}/${milestones.total || 0}`,
            detail: `${milestones.rate || 0}% milestone completion`,
            icon: <Milestone size={20} />,
            color: 'purple',
            iconBg: '#ede9fe',
            iconColor: '#8b5cf6'
        },
        {
            label: 'Risk Score',
            value: `${(riskDistribution.High || 0) + (riskDistribution.Critical || 0)}`,
            detail: 'High/Critical risk projects',
            icon: <Shield size={20} />,
            color: ((riskDistribution.High || 0) + (riskDistribution.Critical || 0)) > 0 ? 'red' : 'green',
            iconBg: ((riskDistribution.High || 0) + (riskDistribution.Critical || 0)) > 0 ? '#fee2e2' : '#d1fae5',
            iconColor: ((riskDistribution.High || 0) + (riskDistribution.Critical || 0)) > 0 ? '#ef4444' : '#10b981'
        }
    ];

    return (
        <div className="pm-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {kpiCards.map((card, i) => (
                <div key={i} className={`pm-kpi-card ${card.color}`}>
                    <div className="pm-kpi-icon" style={{ background: card.iconBg, color: card.iconColor }}>
                        {card.icon}
                    </div>
                    <div className="pm-kpi-value">{card.value}</div>
                    <div className="pm-kpi-label">{card.label}</div>
                    <div className="pm-kpi-detail">{card.detail}</div>
                </div>
            ))}
        </div>
    );
};

export default KPIDashboard;
