import React, { Component } from "react";
import { Card, Header, Form, Input, Icon, Button, Grid, Checkbox, Popup, Label } from "semantic-ui-react";
import API from '../../api';
import "../Tool/Style.css";
import EditableLabel from './editableLabel';

class MiListaTareas extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nombre: "",
            listaTareas: [],
            isOpen: false,
            total: 0,
            terminadas: 0,
            sinTerminar: 0,
        };
    }

    /* Cargar inicial de listado de tareas */
    componentDidMount = () => {
        this.getTareas();
    };

    componentWillMount() {
        this.setState({
            optionsFilter: [
                { value:'1', text:'Todas' },
                { value:'2', text:'Terminadas' },
                { value:'3', text:'Sin Terminar' },
            ],
            selected: ['1'],
        });
    }

    handleChangeFilter = data => {
        this.getTareas(data.value);
    }

    onChange = event => {
        const { name, value } = event.target;
        this.setState(state => ({
            [name]: value
        }));
    };

    changeLabelEvent = (data, id) => {
        //this.setState({ nombre: label });
        this.putTask(id, {nombre: data});
    };
    
    /**
    * Agregar una nueva tarea 
    */
    postTarea = () => {
        if (this.state.nombre) {
            API.post('/nueva-tarea', { nombre: this.state.nombre })
                .then(res => {
                    /* Limpiar el formulario */
                    this.setState({ nombre: "" });
                    /* Refresh */
                    this.getTareas();
                })
                .catch(err => {
                    console.warn(err);
                });
        }
    };

    /* Obtener todas las tareas */
    getTareas = async (value = -1) => {
        let listaTareas = [];
        if (value < 0)
            listaTareas = await API.get('/tareas')
                .then(res => {
                    this.state.total = res.data.total;
                    this.state.sinTerminar = res.data.sinTerminar;
                    this.state.terminadas = res.data.terminadas;
                    return res.data.Data; 
                })
                .catch(err => { console.warn(err); });
        else
            listaTareas = await API.get(`/tareas/${value}`)
                .then(res => { 
                    this.state.total = res.data.total;
                    this.state.sinTerminar = res.data.sinTerminar;
                    this.state.terminadas = res.data.terminadas;
                    return res.data.Data;
                })
                .catch(err => { console.warn(err); });
        if (!listaTareas) {
            return (
                <Card fluid>
                    <Card.Content>
                        <Card.Header textAlign="left">
                            <div>No se encontraron datos</div>
                        </Card.Header>
                    </Card.Content>
                </Card>
            );
            return !1;
        }

        if(listaTareas) {
            listaTareas = listaTareas.sort((a, b) => {
                if(a.estatus) return 1;
                else if (b.estatus) return -1;
                return 0;
            });
        }
        this.setState({
            listaTareas: listaTareas.map((item, index) => {
                const objStyle = {
                    color: 'yellow',
                    cardBackground: { background: "white" },
                    taskComplete: { textDecoration: "none" }
                }
                if(item.estatus) {
                    objStyle.color = "green";
                    objStyle.cardBackground.background = "beige";
                    objStyle.taskComplete["textDecoration"] = "line-through";
                }
                return (
                    <Card key={ index } color={ objStyle.color } fluid style={ objStyle.cardBackground }>
                        <Card.Content>
                            <Card.Header textAlign="left" style={ objStyle.taskComplete }>
                                {/* <div style={{ wordWrap: "break-word" }}>{ item.nombre }</div> */}
                                <EditableLabel style={{ wordWrap: "break-word" }} labelValue={ item.nombre } 
                                    editChangeEvent={(data, e) => this.changeLabelEvent(data, item._id) } 
                                    customEditIconStyle={{ color: "teal" }} customCancelIconStyle={{ color: "red" }} customApproveIconStyle={{ color: "green" }}
                                />
                            </Card.Header>
                        </Card.Content>
                        <Card.Meta textAlign="left" style={{ margin: '15px' }} >
                            <Checkbox onChange={(e, data) => this.putTask(item._id, data) } checked={ item.estatus } label={ <label>Completada</label> } />
                            
                            <Popup trigger={ 
                                <Icon link name="delete" color="red" style={{ paddingLeft: '10px' }}>
                                    <label style={{color: 'black', marginLeft: '5px', fontSize: '15px', fontFamily: 'sans-serif'}}>Eliminar</label>
                                </Icon> 
                            } flowing hoverable>
                                <Grid centered  columns={1}>
                                    <Grid.Column textAlign='center'>
                                        <Header as='h4'>Confirme si, ¿Desea eliminar esta tarea ?</Header>
                                        <Button onClick={() => this.deleteTarea(item._id)}>Eliminar</Button>
                                    </Grid.Column>
                                </Grid>
                            </Popup>
                        </Card.Meta>
                    </Card>
                );
            })
        });
    };

    /* Actualizar una tarea (se marca como terminada) */
    putTask = (id, data) => {
        API.put(`/tarea/${id}`, { estatus: data.checked, nombre: data.nombre })
            .then(res => {
                this.getTareas();
            })
            .catch(err => {
                console.warn(err);
            });
    };

    /* Deshacer el estatus de la tarea de verdadero a falso */
    undoTarea = index => {};

    /* Eliminar una tarea de la lista*/
    deleteTarea = id => {
        API.delete(`/tarea/${id}`)
            .then(res => {
                this.getTareas();
            })
            .catch(err => {
                console.warn(err);
            });
    };

    render() {
        return (
            <div>
                <div>
                    <Header as="h1">
                        <div className="app-header">Mi Lista de Tareas</div>{" "}
                    </Header>
                </div>
                <div className="app-form">
                    <Form onSubmit={ this.postTarea }>
                        <Grid>
                            <Grid.Column width={8}>
                                <Form.Field>
                                    <Input type="text" name="nombre" onChange={ this.onChange } value={ this.state.nombre } fluid placeholder="Agregar una tarea" />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column width={2} stretched verticalAlign="middle">
                                <Form.Group inline className="no-margin">
                                    <Form.Field><Button primary>Guardar</Button></Form.Field>
                                </Form.Group>
                            </Grid.Column>
                            <Grid.Column width={4} className="no-margin">
                                <Form.Dropdown placeholder='Please select' defaultValue={this.state.selected} fluid selection 
                                    options={ this.state.optionsFilter }
                                    onChange={(e, data) => this.handleChangeFilter(data) }
                                />
                            </Grid.Column>
                        </Grid>
                        <Grid>
                            <Grid.Column width={6}>
                                <Form.Group inline className="no-margin">
                                    <Label>Total Tareas:</Label>
                                    <Label circular color={'teal'} style={{fontFamily: 'serif', fontSize: '12px', color: 'gray', marginRight: '20px'}}>{this.state.total}</Label>
                                    <Label>Terminadas:</Label>
                                    <Label circular color={'teal'} style={{fontFamily: 'serif', fontSize: '12px', color: 'gray', marginRight: '20px' }}>{this.state.terminadas}</Label>
                                    <Label>Sin Terminar:</Label>
                                    <Label circular color={'teal'} style={{fontFamily: 'serif', fontSize: '12px', color: 'white' }}>{this.state.sinTerminar}</Label>
                                </Form.Group>
                            </Grid.Column>
                        </Grid>
                    </Form>
                </div>
                <div>
                    <Card.Group>{ this.state.listaTareas }</Card.Group>
                </div>
            </div>
        );
    };
}

export default MiListaTareas;