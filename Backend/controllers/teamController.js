const Team = require('../models/Team');

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members.user', 'fullName email')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('members.user', 'fullName email')
            .populate('createdBy', 'fullName');
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTeam = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const team = await Team.create(req.body);
        res.status(201).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        let team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        team = await Team.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        await team.deleteOne();
        res.status(200).json({ success: true, message: 'Team deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const memberExists = team.members.some(m => m.user.toString() === userId);
        if (memberExists) {
            return res.status(400).json({ success: false, message: 'User already in team' });
        }

        team.members.push({ user: userId, role: role || 'Member' });
        await team.save();

        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
        await team.save();

        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
