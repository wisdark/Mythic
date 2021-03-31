import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import MythicTextField from '../../MythicComponents/MythicTextField';
import {useQuery, gql} from '@apollo/client';
import LinearProgress from '@material-ui/core/LinearProgress';

const getDescriptionQuery = gql`
query getDescriptionQuery ($payload_id: Int!) {
  payload_by_pk(id: $payload_id) {
    build_message
    build_error
    id
  }
}
`;

export function PayloadBuildMessageDialog(props) {
    const [payloadData, setPayloadData] = useState({});
    const [viewError, setViewError] = useState(false);
    const { loading, error } = useQuery(getDescriptionQuery, {
        variables: {payload_id: props.payload_id},
        onCompleted: data => {
            setViewError(props.viewError);
            setPayloadData({"message": data.payload_by_pk.build_message,
                            "error": data.payload_by_pk.build_error});
            
        },
        fetchPolicy: "network-only"
    });
    useEffect( () => {
        setViewError(props.viewError);
    }, [props.viewError]);
    if (loading) {
     return <LinearProgress style={{marginTop: "10px"}} />;
    }
    if (error) {
     console.error(error);
     return <div>Error!</div>;
    }
    
  return (
    <React.Fragment>
        <DialogTitle id="form-dialog-title">Payload Build Message</DialogTitle>
        <DialogContent dividers={true}>
            <MythicTextField multiline={true} onChange={()=>{}} value={viewError ? payloadData["error"] : payloadData["message"]} />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Close
          </Button>
        </DialogActions>
  </React.Fragment>
  );
}
