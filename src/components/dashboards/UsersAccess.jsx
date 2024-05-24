import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from "../navbar/DashboardNavbar";

export default function UsersAccess() {
  const { dashboardId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
    : null;
  const userId = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(window.atob(jwtToken.split(".")[1])).userId
    : null;

  useEffect(() => {
    fetchMembers();
  }, [userId, dashboardId, jwtToken]);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setMembers(
        response.data.map((member) => ({
          ...member,
          accessLevel: member.accessLevel || "VIEWER",
          role: member.role || "NONE",
        }))
      );
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to fetch members");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, dashboardId, jwtToken]);

  const handleAddMember = async () => {
    if (!userInput) return;
    setIsLoading(true);
    try {
      await axios.post(
        DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId) +
          "/add",
        {
          usernameOrEmail: userInput,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setUserInput("");
      fetchMembers();
    } catch (error) {
      console.error(
        "Error adding member:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "User was not found ");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAccessLevel = async (member, newAccessLevel) => {
    const changeAccessUrl = `${DashboardAPIs.getDashboardMembersByDashboardId(
      userId,
      dashboardId
    )}/${member.userName}/changeAccess`;

    console.log("Attempting to change access level to:", newAccessLevel);
    console.log("Sending to URL:", changeAccessUrl);

    try {
      const response = await axios.put(
        changeAccessUrl,
        JSON.stringify(newAccessLevel),
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Access level changed successfully:", response.data);

      const updatedMembers = members.map((m) => {
        if (m.id === member.id) {
          return { ...m, accessLevel: newAccessLevel };
        }
        return m;
      });

      setMembers(updatedMembers);
      fetchMembers();
    } catch (error) {
      console.error(
        "Error changing access level:",
        error.response ? error.response.data : error
      );
    }
  };

  const handleDeleteMember = async (member) => {
    console.log("Deleting member:", member); // Log to see what is received

    if (!member || (!member.userEmail && !member.userName)) {
      console.error("Member data is incomplete:", member);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove ${
          member.userEmail || member.userName
        }?`
      )
    )
      return;
    setIsLoading(true);
    const deleteMemberUrl = `${DashboardAPIs.getDashboardMembersByDashboardId(
      userId,
      dashboardId
    )}/remove`;
    const payload = {
      usernameOrEmail: member.userEmail || member.userName,
    };

    console.log(
      "Sending DELETE to URL:",
      deleteMemberUrl,
      "Payload:",
      JSON.stringify(payload)
    );

    try {
      const result = await axios({
        method: "delete",
        url: deleteMemberUrl,
        data: payload, // Sending payload in the body of a DELETE request
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      console.log("Member removed successfully", result.data);
      const updatedMembers = members.filter((m) => m.id !== member.id);
      setMembers(updatedMembers);
      setError("Member removed successfully");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Failed to remove member");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
      fetchMembers();
    }
  };

  const handleChangeRole = async (member, newRole) => {
    if (!member.userId) {
      console.error("Member ID is undefined:", member);
      return;
    }

    const changeRoleUrl = `https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users/${member.userId}/dashboards/${dashboardId}/assign-role`;

    console.log("Attempting to change role to:", newRole);
    console.log("Sending to URL:", changeRoleUrl);

    try {
      const response = await axios.post(
        changeRoleUrl,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Role changed successfully:", response.data);

      const updatedMembers = members.map((m) => {
        if (m.userId === member.userId) {
          return { ...m, role: newRole };
        }
        return m;
      });

      setMembers(updatedMembers);
      fetchMembers();
    } catch (error) {
      console.error(
        "Error changing role:",
        error.response ? error.response.data : error
      );
    }
  };

  const handleGenerateInviteLink = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        DashboardAPIs.generateInviteLinkByDashboardId(dashboardId),
        {},
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setInviteLink(response.data.link);
    } catch (error) {
      console.error("Error generating invite link:", error);
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
      <Container maxWidth="sm" style={{ marginTop: "180px" }}>
        <Typography component={'div'} variant="h6">Manage Dashboard Access</Typography>
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMember}
              disabled={!userInput}
            >
              Add Member
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGenerateInviteLink}
              style={{ marginLeft: 10 }}
            >
              Generate Invite Link
            </Button>
            {inviteLink && (
              <TextField
                fullWidth
                label="Invite Link"
                value={
                  DashboardAPIs.generateInviteLinkByDashboardId(dashboardId) +
                  "/use/" +
                  inviteLink
                }
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
                <ListItem key={member.id} divider>
                  <ListItemText primary={member.userEmail || member.userName} />
                  <ListItemSecondaryAction
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FormControl
                      variant="outlined"
                      size="small"
                      style={{ minWidth: 120 }}
                    >
                      <InputLabel>Access Level</InputLabel>
                      <Select
                        value={member.accessLevel}
                        onChange={(e) =>
                          handleChangeAccessLevel(member, e.target.value)
                        }
                        label="Access Level"
                      >
                        <MenuItem value="NONE">None</MenuItem>
                        <MenuItem value="VIEWER">Viewer</MenuItem>
                        <MenuItem value="EDITOR">Editor</MenuItem>
                        <MenuItem value="OWNER">Owner</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl
                      variant="outlined"
                      size="small"
                      style={{ minWidth: 120 }}
                    >
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={member.role}
                        onChange={(e) =>
                          handleChangeRole(member, e.target.value)
                        }
                        label="Role"
                      >
                        <MenuItem value="ENTREPRENEUR">Entrepreneur</MenuItem>
                        <MenuItem value="EMPLOYEE">Employee</MenuItem>
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="RETIREE">Retiree</MenuItem>
                        <MenuItem value="HOUSEMAKER">Housemaker</MenuItem>
                        <MenuItem value="CHILD">Child</MenuItem>
                        <MenuItem value="NONE">None</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteMember(member)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity="error"
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            </Snackbar>
          </>
        )}
      </Container>
    </>
  );
}
