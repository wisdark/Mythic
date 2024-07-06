import React, { useEffect } from 'react';
import {Link, Button, IconButton, Typography} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MythicStyledTableCell from '../../MythicComponents/MythicTableCell';
import {TagsDisplay} from '../../MythicComponents/MythicTag';
import {MythicDialog, MythicViewJSONAsTableDialog} from "../../MythicComponents/MythicDialog";
import {MythicConfirmDialog} from '../../MythicComponents/MythicConfirmDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import {useTheme} from '@mui/material/styles';
import {deleteTagMutation} from '../../MythicComponents/MythicTag';
import {useMutation} from '@apollo/client';
import {snackActions} from "../../utilities/Snackbar";
import {b64DecodeUnicode} from '../Callbacks/ResponseDisplay';

export function TagTable(props){
    const [tags, setTags] = React.useState([]);
    useEffect( () => {
        setTags([...props.tags]);
    }, [props.tags]);
    const onDelete = (tagID) => {
        const newTags = tags.filter(t => t.id !== tagID);
        setTags(newTags);
    }
    return (
        <TableContainer component={Paper} className="mythicElement" >
            <Table stickyHeader size="small" style={{"tableLayout": "fixed", "maxWidth": "100%", "overflow": "scroll"}}>
                <TableHead>
                    <TableRow>
                        <TableCell style={{width: "4rem"}}>Delete</TableCell>
                        <TableCell style={{width: "20%"}}>TagType</TableCell>
                        <TableCell style={{width: "20%"}}>Source</TableCell>
                        <TableCell>Tagged Element Information</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                {tags.map( (op) => (
                    <TagTableRow
                        key={"tag" + op.id}
                        onDelete={onDelete}
                        {...op}
                    />
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
function TagTableRow(props){
    const theme = useTheme();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [deleteTag] = useMutation(deleteTagMutation, {
        onCompleted: (data) => {
            snackActions.success("Successfully deleted tag");
            props.onDelete(props.id);
        },
        onError: (data) => {
            snackActions.error("Failed to delete tag");
        }
    })
    const onAcceptDelete = () => {
        deleteTag({variables: {tag_id: props.id}})
    }
    return (
        <React.Fragment>
            <TableRow hover>
                <MythicStyledTableCell>
                    <IconButton size="small" onClick={()=>{setOpenDeleteDialog(true);}}
                                style={{color: theme.palette.error.main}}
                                variant="contained"><DeleteIcon/>
                    </IconButton>
                </MythicStyledTableCell>
                <MythicStyledTableCell >
                    <div style={{float: "left"}}><TagsDisplay  tags={[props]} /></div>
                </MythicStyledTableCell>
                <MythicStyledTableCell>{props.source}</MythicStyledTableCell>
                <MythicStyledTableCell style={{wordBreak: "break-all"}}><TagTableRowElement {...props} /></MythicStyledTableCell>
            </TableRow>
            {openDeleteDialog &&
                <MythicConfirmDialog onClose={() => {setOpenDeleteDialog(false);}}
                                     onSubmit={onAcceptDelete} open={openDeleteDialog}
                                     acceptText={ "Remove" }/>
            }

        </React.Fragment>
    )
}
function TagTableRowElement(props){
    const [viewPermissionsDialogOpen, setViewPermissionsDialogOpen] = React.useState(false);

    const getElement = () => {
        if(props.task) {
            return (
                <TableContainer component={Paper} className="mythicElement" >
                    <Table stickyHeader size="small" style={{"tableLayout": "fixed", "maxWidth": "100%", "overflow": "scroll"}}>
                        <TableBody>
                            <TableRow hover>
                                <TableCell style={{width: "20%"}}>Element Type</TableCell>
                                <TableCell><b>Task</b></TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell >Task / Callback</TableCell>
                                <TableCell>
                                    <Link href={"/new/task/" + props.task.display_id} color="textPrimary" target={"_blank"}>
                                        {props.task.display_id}
                                    </Link>
                                    {"  /  "}
                                    <Link href={"/new/callbacks/" + props.task.callback.display_id} color="textPrimary" target={"_blank"}>
                                        {props.task.callback.display_id}
                                    </Link>
                                </TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Command</TableCell>
                                <TableCell>
                                    {props.task.command_name} {props.task.display_params}
                                </TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Comment</TableCell>
                                <TableCell>{props.task.comment}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        } else if(props.credential) {
            return (
                <TableContainer component={Paper} className="mythicElement" >
                    <Table stickyHeader size="small" style={{"tableLayout": "fixed", "maxWidth": "100%", "overflow": "scroll"}}>
                        <TableBody>
                            <TableRow hover>
                                <TableCell style={{width: "20%"}}>Element Type</TableCell>
                                <TableCell><b>Credential</b></TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Account</TableCell>
                                <TableCell>{props.credential.account}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Realm</TableCell>
                                <TableCell>{props.credential.realm}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Comment</TableCell>
                                <TableCell>{props.credential.comment}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Credential Type</TableCell>
                                <TableCell>{props.credential.type}</TableCell>
                            </TableRow>
                            <TableRow hover style={{whiteSpace: "pre"}}>
                                <TableCell>Credential</TableCell>
                                <TableCell>{props.credential.credential_text}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        } else if(props.mythictree) {
            return (
                <TableContainer component={Paper} className="mythicElement" >
                    <Table stickyHeader size="small" style={{"tableLayout": "fixed", "maxWidth": "100%", "overflow": "scroll"}}>
                        <TableBody>
                            <TableRow hover>
                                <TableCell style={{width: "15%"}}>Element Type</TableCell>
                                <TableCell>{props.mythictree.tree_type === "file" ? <b>File Browser</b> : <b>Process Browser</b>}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell >Name</TableCell>
                                <TableCell>{props.mythictree.name_text}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>
                                    {props.mythictree.tree_type === "file" ? (
                                        "Path"
                                    ) : (
                                        "PID"
                                    )}
                                </TableCell>
                                <TableCell>{props.mythictree.full_path_text}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Host</TableCell>
                                <TableCell>{props.mythictree.host}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Comment</TableCell>
                                <TableCell>{props.mythictree.comment}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Metadata</TableCell>
                                <TableCell>
                                    <Button color="primary" variant="outlined" onClick={() => setViewPermissionsDialogOpen(true)}><PlaylistAddCheckIcon /></Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    {viewPermissionsDialogOpen &&
                        <MythicDialog fullWidth={true} maxWidth="md" open={viewPermissionsDialogOpen}
                                      onClose={()=>{setViewPermissionsDialogOpen(false);}}
                                      innerDialog={<MythicViewJSONAsTableDialog title="View Permissions Data"
                                                                                leftColumn="Permission" rightColumn="Value"
                                                                                value={props.mythictree.metadata}
                                                                                onClose={()=>{setViewPermissionsDialogOpen(false);}} />}
                        />
                    }
                </TableContainer>
            )
        } else if(props.filemetum) {
            return (
                <TableContainer component={Paper} className="mythicElement" >
                    <Table stickyHeader size="small" style={{"tableLayout": "fixed", "maxWidth": "100%", "overflow": "scroll"}}>
                        <TableBody>
                            <TableRow hover>
                                <TableCell style={{width: "15%"}}>Element Type</TableCell>
                                <TableCell><b>{props.filemetum.is_screenshot ? "Screenshot" : props.filemetum.is_download_from_agent ? "File Download" : "File Upload"}</b></TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell >Filename</TableCell>
                                <TableCell>
                                    <Link style={{wordBreak: "break-all"}}  color="textPrimary" download underline="always" target="_blank" href={"/direct/download/" + props.filemetum.agent_file_id}>{b64DecodeUnicode(props.filemetum.filename_text)}</Link>
                                </TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Hash</TableCell>
                                <TableCell>
                                    <Typography variant="body2" style={{wordBreak: "break-all"}}>MD5: {props.filemetum.md5}</Typography>
                                    <Typography variant="body2" style={{wordBreak: "break-all"}}>SHA1: {props.filemetum.sha1}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Comment</TableCell>
                                <TableCell>{props.filemetum.comment}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Full Remote Path</TableCell>
                                <TableCell>
                                    {props.filemetum.host}<br/>
                                    {b64DecodeUnicode(props.filemetum.full_remote_path_text)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        }else if(props.keylog_id) {
            return <Typography ><b>Keylog: </b> {props.keylog_id}</Typography>
        }else if(props.response_id){
            return <Typography ><b>Response: </b> {props.response_id}</Typography>
        }else if(props.taskartifact_id){
            return <Typography ><b>Artifact: </b> {props.taskartifact_id}</Typography>
        } else {
            console.log("unknown id for tag")
        }
    }
    return getElement()
}

