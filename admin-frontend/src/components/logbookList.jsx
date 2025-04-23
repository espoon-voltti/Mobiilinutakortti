import React, { useState } from 'react';
import { Button, DateInput, Form, useNotify } from 'react-admin';
import { useParams } from 'react-router-dom';
import {
    Table, TableHead,
    TableRow, TableCell, TableBody,
    Link
} from '@material-ui/core';
import {
    Container,
    LogBookCard,
    LogBookCardHeader,
    LogBookCardContent,
    LogBookCardContentSelect,
    VerticalCardPadding,
} from './styledComponents/logbook';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

let LogBookListView = () => {
    const { youthClubId } = useParams();
    const [clubName, setClubName] = useState('');
    const [table, setTable] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setSearchDate('');
        setTable([]);
    }

    const mapJuniorsToUI = (juniorArray) => {
        const UI = [];
        let key = 0;
        juniorArray.forEach(junior => {
            UI.push(
                <TableRow key={key}>
                    <TableCell>
                        <Link href={`#/junior/${junior.id}`} color="inherit">
                            {junior.name}
                        </Link>
                    </TableCell>
                    <TableCell>{junior.time}</TableCell>
                </TableRow >
            )
            key++;
        });
        return UI;
    }

    const getCheckIns = async values => {
        const date = new Date(values.queryDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.checkIns;
            const body = JSON.stringify({
                clubId: youthClubId,
                date: date
            });
            const options = {
                method: 'POST',
                body
            };
            resetState();
            await httpClientWithResponse(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        notify(response.message, "warning");
                    } else {
                        setSearchDate(date.toLocaleDateString());
                        setClubName(response.clubName);
                        setTable(mapJuniorsToUI(response.juniors))
                    }
                });
        }
    }

    return (
        <Container>
            <Form onSubmit={getCheckIns}>
                <LogBookCard>
                    <LogBookCardHeader title="Valitse Päivämäärä" />
                    <LogBookCardContentSelect>
                        <DateInput label="Päivämäärä" source="queryDate" />
                        <Button type="submit" className="focusable">Hae</Button>
                    </LogBookCardContentSelect>
                </LogBookCard>
            </Form>
            <VerticalCardPadding />
            {clubName !== '' &&
                <LogBookCard>
                    <LogBookCardHeader title={clubName} subheader={searchDate} />
                    <LogBookCardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nimi</TableCell>
                                    <TableCell>Aika</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {table}
                            </TableBody>
                        </Table>
                    </LogBookCardContent>
                </LogBookCard>
            }
        </Container>
    )
}

export default LogBookListView;
