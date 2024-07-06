import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PayloadsTableRow } from './PayloadsTableRow';
import {useTheme} from '@mui/material/styles';
import {ImportPayloadConfigDialog} from './ImportPayloadConfigDialog';
import { MythicDialog } from '../../MythicComponents/MythicDialog';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {useNavigate} from 'react-router-dom';
import Pagination from '@mui/material/Pagination';


export function PayloadsTable({payload, onDeletePayload, onUpdateCallbackAlert, onRestorePayload, me, pageData, onChangePage, onChangeShowDeleted}){
    const theme = useTheme();
    const [showDeleted, setShowDeleted] = React.useState(false);
    const [openPayloadImport, setOpenPayloadImport] = React.useState(false);
    const dropdownAnchorRef = React.useRef(null);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const navigate = useNavigate();
    const toggleShowDeleted = () => {
        setShowDeleted(!showDeleted);
        onChangeShowDeleted(!showDeleted);
    }
    const dropDownOptions = [
        {
            name: "Generate New Payload",
            click: () => {
                navigate("/new/createpayload");
            }
        },
        {
            name: "Generate New Wrapper Payload",
            click: () => {
                navigate("/new/createwrapper");
            }
        },
        {
            name: "Import Payload Config",
            click: () => {
                setOpenPayloadImport(true)
            }
        },
        {
            name: showDeleted ? "Hide Deleted Payloads" : "Show Deleted Payloads",
            click: toggleShowDeleted
        },
    ]
    const handleMenuItemClick = (event, index) => {
        dropDownOptions[index].click();
        setDropdownOpen(false);
    };
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <Paper elevation={5} style={{backgroundColor: theme.pageHeader.main, color: theme.pageHeaderText.main,marginBottom: "5px", marginTop: "10px"}} variant={"elevation"}>
                <Typography variant="h3" style={{textAlign: "left", display: "inline-block", marginLeft: "20px"}}>
                    Payloads
                </Typography>
                <ButtonGroup variant="contained" ref={dropdownAnchorRef} aria-label="split button" style={{float: "right", marginRight: "10px", marginTop:"10px"}} color="primary">
                    <Button size="small" color="primary" aria-controls={dropdownOpen ? 'split-button-menu' : undefined}
                        aria-expanded={dropdownOpen ? 'true' : undefined}
                        aria-haspopup="menu"
                        onClick={() => setDropdownOpen(!dropdownOpen)}>
                            Actions <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper open={dropdownOpen} anchorEl={dropdownAnchorRef.current} role={undefined} transition disablePortal style={{zIndex: 10}}>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                    }}
                    >
                    <Paper className={"dropdownMenuColored"}>
                        <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                        <MenuList id="split-button-menu">
                            {dropDownOptions.map((option, index) => (
                            <MenuItem
                                key={option.name}
                                onClick={(event) => handleMenuItemClick(event, index)}
                            >
                                {option.name}
                            </MenuItem>
                            ))}
                        </MenuList>
                        </ClickAwayListener>
                    </Paper>
                    </Grow>
                )}
                </Popper>
                {openPayloadImport &&
                    <MythicDialog fullWidth={true} maxWidth="sm" open={openPayloadImport} 
                        onClose={()=>{setOpenPayloadImport(false);}} 
                        innerDialog={<ImportPayloadConfigDialog onClose={()=>{setOpenPayloadImport(false);}} />}
                    />
                }
            </Paper>               
            <div style={{display: "flex", flexGrow: 1, overflowY: "auto"}}>
                <TableContainer component={Paper} className="mythicElement">
                    <Table size="small" style={{ "maxWidth": "100%", "overflow": "scroll"}}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{width: "4rem"}}>Delete</TableCell>
                                <TableCell style={{width: "6rem"}}>Modify</TableCell>
                                <TableCell>Build Progress</TableCell> 
                                <TableCell style={{width: "4rem"}}>Download</TableCell>
                                <TableCell>File</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell >C2 Status</TableCell>
                                <TableCell style={{width: "4rem"}}>Agent</TableCell>
                                <TableCell style={{width: "4rem"}}>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {payload.map( (op) => (
                            <PayloadsTableRow
                                me={me}
                                onDeletePayload={onDeletePayload}
                                onAlertChanged={onUpdateCallbackAlert}
                                showDeleted={showDeleted}
                                onRestorePayload={onRestorePayload}
                                key={"payload" + op.id}
                                {...op}
                            />
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div style={{background: "transparent", display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "5px", paddingBottom: "10px"}}>
                <Pagination count={Math.ceil(pageData.totalCount / pageData.fetchLimit)} variant="outlined" color="primary" boundaryCount={1}
                    siblingCount={1} onChange={onChangePage} showFirstButton={true} showLastButton={true} style={{padding: "20px"}}/>
                <Typography style={{paddingLeft: "10px"}}>Total Results: {pageData.totalCount}</Typography>
            </div>
        </div>
    )
}

