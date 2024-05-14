import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  CircularProgress,
  Button,
  Container,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,  
  Alert   
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';

export default function UsersAccess() {
  const { dashboardId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;
  const userId = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(window.atob(jwtToken.split('.')[1])).userId : null;

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId), {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to fetch members');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, dashboardId, jwtToken]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async () => {
    if (!userInput) return;
    setIsLoading(true);
    try {
      await axios.post(DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId) + '/add', {
        usernameOrEmail: userInput
      }, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUserInput('');
      fetchMembers();  
    } catch (error) {
      console.error('Error adding member:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'User was not found ');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.userEmail || member.userName}?`)) return;
    setIsLoading(true);
    const deleteMemberUrl = `${DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId)}/remove`;
    const payload = {
      usernameOrEmail: member.userEmail || member.userName,
    };
  
    console.log("Sending DELETE to URL:", deleteMemberUrl, "Payload:", JSON.stringify(payload));
  
    try {
      const result = await axios({
        method: 'delete',
        url: deleteMemberUrl,
        data: payload, 
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      console.log("Member removed successfully", result.data);
      const updatedMembers = members.filter(m => m.id !== member.id);
      setMembers(updatedMembers);
      setError('Member removed successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
      fetchMembers();

    }
  };

  const handleGenerateInviteLink = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(DashboardAPIs.generateInviteLinkByDashboardId(dashboardId), {}, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setInviteLink(response.data.link); 
    } catch (error) {
      console.error('Error generating invite link:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <DashboardNavbar />
      <Container maxWidth="sm" style={{ marginTop: '180px' }}>
        <Typography variant="h6">Manage Dashboard Access</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              fullWidth
              label="User Email or Username"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={handleAddMember} disabled={!userInput}>
              Add Member
            </Button>
            <Button variant="contained" color="secondary" onClick={handleGenerateInviteLink} style={{ marginLeft: 10 }}>
              Generate Invite Link
            </Button>
            {inviteLink && (
              <TextField
                fullWidth
                label="Invite Link"
                value={DashboardAPIs.generateInviteLinkByDashboardId(dashboardId)+"/use/"+inviteLink}
                margin="normal"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                helperText="Copy this link and send it to someone to join the dashboard."
              />
            )}
            <List>
  {members.map((member) => (
    <ListItem key={member.id}>
      <ListItemText primary={member.userEmail || member.userName} />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMember(member)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  ))}
</List>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Snackbar>
          </>
        )}
      </Container>
    </>
  );
}
