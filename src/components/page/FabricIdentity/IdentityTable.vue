<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 区块链参与者表格
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-row>
                    <el-col :span='16'>
                        <el-select
                            v-model="search.searchType"
                            clearable
                            placeholder="身份类型"
                            class="handle-select mr10"
                        >
                            <el-option v-for="item in identityTypeList" :key="item" :label="item" :value="item"></el-option>
                        </el-select>
                        <el-input v-model="search.searchName" clearable placeholder="身份名称" style="width:120px;" class="handle-input mr10"></el-input>
                        <el-button icon="el-icon-search" @click="handleSearch">搜索</el-button>
                        <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>                        
                        <el-button type="primary" icon="el-icon-edit" @click="handleOrgEdit">组织结构管理</el-button>
                        <el-button type="success" icon="el-icon-plus" @click="handleAddIdentity">添加参与者</el-button>
                    </el-col>
                    <el-col :span='5' :offset='3'>
                        <el-alert title="请保证身份名唯一，重名身份可添加数字进行区分" type="info" :closable="false" center show-icon></el-alert>
                    </el-col>
                </el-row>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="identity_id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="identity_name" label="参与者名" width="80"></el-table-column>
                <el-table-column prop="identity_type" label="参与者类型" width="100"></el-table-column>
                <el-table-column prop="identity_affiliation" label="参与者从属" width="100"></el-table-column>
                <el-table-column prop="identity_attrs" label="参与者属性"></el-table-column>
                <el-table-column prop="identity_ip" label="参与者证书存储地址"></el-table-column>
                <el-table-column prop="identity_user" label="参与者主机用户名" width="80"></el-table-column>
                <el-table-column prop="identity_path" label="参与者主机路径"></el-table-column>
                <el-table-column prop="identity_ctime" label="添加时间"></el-table-column>
                <el-table-column label="身份状态" align="center" width="100">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.identity_status==0?'danger':
                            (scope.row.identity_status==1?'warning':
                            (scope.row.identity_status==2?'success':''))"
                        >{{scope.row.identity_status==0?"未注册":
                        (scope.row.identity_status == 1?"已注册":
                        (scope.row.identity_status==2?"已登记":""))}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-folder-add"
                            class="orange"
                            @click="handleRegister(scope.$index, scope.row)"
                        >注册身份</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-folder-checked"
                            @click="handleEnroll(scope.$index, scope.row)"
                        >登记证书</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-folder-delete"
                            class="red"
                            @click="handleRevoke(scope.$index, scope.row)"
                        >注销证书</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-download"
                            @click="handleInstall(scope.$index, scope.row)"
                        >安装证书</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
            <el-row :gutter="20" type="flex" justify="space-between">
                <el-col :span="2">
                    <el-button type="danger" icon="el-icon-delete" @click="delAllSelection">批量删除</el-button>
                </el-col>
                <el-col>
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
                </el-col>
            </el-row>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" :close-on-click-modal="false" width="35%">
            <el-form ref="form" :model="form" label-width="140px">
                <el-form-item label="身份名称">
                    <el-input v-model="form.identity_name" disabled></el-input>
                </el-form-item>
                <el-form-item label="身份密码">
                    <el-input v-model="form.identity_secret"></el-input>
                </el-form-item>
                <el-form-item label="身份类型"> 
                    <el-radio disabled v-model="form.identity_type" label="client">client</el-radio>
                    <el-radio disabled v-model="form.identity_type" label="peer">peer</el-radio>
                    <el-radio disabled v-model="form.identity_type" label="order">order</el-radio>
                    <el-radio disabled v-model="form.identity_type" label="user">user</el-radio>
                </el-form-item>
                <el-form-item label="身份从属">
                    <el-cascader v-model="form.identity_affiliation" :options="orgOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="身份属性">
                    <el-input v-model="form.identity_attrs"></el-input>
                </el-form-item>
                <el-form-item label="证书存储地址">
                    <el-input v-model="form.identity_ip"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机用户名">
                    <el-input v-model="form.identity_user"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机密码">
                    <el-input type="password" v-model="form.identity_pw"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机路径">
                    <el-input v-model="form.identity_path"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加参与者身份信息弹出框 -->
        <el-dialog title="添加参与者身份信息" :visible.sync="addIdentityVisible" :close-on-click-modal="false" width="35%">
            <el-form ref="form" :model="form" :rules="rules" label-width="140px">
                <el-form-item label="身份名称" prop="identity_name">
                <el-input v-model="form.identity_name"></el-input>
                </el-form-item>
                <el-form-item label="身份密码" prop="identity_secret">
                    <el-input v-model="form.identity_secret"></el-input>
                </el-form-item>
                <el-form-item label="身份类型" prop="identity_type"> 
                    <el-radio-group v-model="form.identity_type">
                        <el-radio label="client"></el-radio>
                        <el-radio label="peer"></el-radio>
                        <el-radio label="order"></el-radio>
                        <el-radio label="user"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="身份从属" prop="identity_affiliation">
                    <el-cascader v-model="form.identity_affiliation" :options="orgOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="身份属性">
                    <el-input v-model="form.identity_attrs"></el-input>
                </el-form-item>
                <el-form-item label="证书存储地址" prop="identity_ip">
                    <el-input v-model="form.identity_ip"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机用户名" prop="identity_user">
                    <el-input v-model="form.identity_user"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机密码" prop="identity_pw">
                    <el-input type="password" v-model="form.identity_pw"></el-input>
                </el-form-item>
                <el-form-item label="参与者主机路径" prop="identity_path">
                    <el-input v-model="form.identity_path"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit('form')">表单提交</el-button>
                    <el-button type="danger" @click="onClear('form')">清空</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 编辑组织结构弹出框 -->
        <el-dialog title="编辑组织结构" :visible.sync="editOrgVisible" :close-on-click-modal="false" width="35%">
            <el-tree :data="orgData" node-key="id" default-expand-all :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span v-if="node.data.isEdit==true">
                        <el-input size="mini" v-model="node.data.label" @blur="saveOrgNode(node)"></el-input>
                    </span>
                    <span v-else>{{ node.data.label }}</span>
                    <span>
                        <el-button type="text" size="mini" icon="el-icon-plus" @click="appendOrg(data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-edit" @click="editOrg(node, data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-delete" @click="removeOrg(node, data)"></el-button>
                    </span>
                </span>
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleAddTop">添加根节点</el-button>
                <el-button @click="editOrgVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveOrgEdit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchData } from '../../../api/index';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                pageIndex: 1,
                pageSize: 10
            },
            search: {},
            tableData: [],
            multipleSelection: [],
            delList: [],
            identityTypeList: ["client", "peer", "order"],
            editVisible: false,
            addIdentityVisible: false,
            pageTotal: 0,
            form: {
                identity_affiliation: [],
            },
            idx: -1,
            id: -1,
            editOrgVisible: false,
            orgId: -1,
            orgObj: {},
            orgData: [],
            orgOpts: [],
            rules:{
                identity_name: [
                    { required: true, message: '参与者名不为空', trigger: 'change' },
                ],
                identity_secret: [
                    { required: true, message: '用户密码不为空', trigger: 'change' },
                ],
                identity_type: [
                    { required: true, message: '参与者类型不为空', trigger: 'change' },
                ],
                identity_affiliation: [
                    { required: true, message: '参与者从属不为空', trigger: 'change' },
                ],
                identity_ip: [
                    { required: true, message: '参与者证书IP地址不为空', trigger: 'change' },
                    { 
                        validator: (rule, value, callback) => {
                        const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                        if (reg.test(value)) {
                            callback();
                        } else {
                            return callback(new Error('输入格式不合法！'));
                        }}, trigger:'blur' 
                    },
                ],
                identity_user: [
                    { required: true, message: '参与者主机用户名不为空', trigger: 'change' },
                ],
                identity_pw: [
                    { required: true, message: '参与者主机密码不为空', trigger: 'change' },
                ],
                identity_path: [
                    { required: true, message: '参与者主机路径不为空', trigger: 'change' },
                ],
            },
            
        };
    },
    created() {
        this.getData();
        this.getOrgData();
    },
    methods: {
        // 获取后台数据
        getData() {
            // fetchData(this.query).then(res => {
            //     this.tableData = res.list;
            //     this.pageTotal = res.pageTotal || 50;
            // });
            this.$axios
                .post('api/identity/list', {
                    page_index: this.query.pageIndex,
                    page_size: this.query.pageSize,
                    search_type: this.search.searchType == null ? '' : this.search.searchType,
                    search_name: this.search.searchName == null ? '' : this.search.searchName
                })
                .then(res => {
                    console.log(res.data);
                    this.tableData = res.data.list;
                    this.pageTotal = res.data.count || 50;
                });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.tableData.splice(index, 1);
                    let ids = [];
                    ids.push(row.identity_id);
                    this.$axios
                        .post('api/identity/delete', {
                            ids: ids
                        })
                        .then(res => {
                            this.$message.success('删除成功');
                        });
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            let ids = [];
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].identity_name + ' ';
                ids.push(this.multipleSelection[i].identity_id)
            }
            this.$confirm('确定要删除' + str + '吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$axios
                        .post('api/identity/delete', {
                            ids: ids,
                        })
                        .then(res => {
                            if (res.data.code == 0) {
                                this.$message.success(`删除了${str}`);
                                this.handleRefresh();
                            } else {
                                this.$message.error('删除失败');
                            }
                        });
                })
                .catch(() => {});
            this.multipleSelection = [];
        },
        handleRefresh() {
            this.getData();
        },
        clearSelection() {
            this.search = {};
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            var data = row;
            var iaArr = data.identity_affiliation.split("/");
            this.$set(this.form, 'identity_affiliation', iaArr);
            this.$set(this.form, 'identity_id', data.identity_id);
            this.$set(this.form, 'identity_name', data.identity_name);
            this.$set(this.form, 'identity_secret', data.identity_secret);
            this.$set(this.form, 'identity_type', data.identity_type);
            this.$set(this.form, 'identity_attrs', data.identity_attrs);
            this.$set(this.form, 'identity_ip', data.identity_ip);
            this.$set(this.form, 'identity_user', data.identity_user);
            this.$set(this.form, 'identity_pw', data.identity_pw);
            this.$set(this.form, 'identity_path', data.identity_path);
            this.editVisible = true;
        },
        handleAddIdentity() {
            this.form = {
                identity_affiliation: [],
            };
            this.addIdentityVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            var orgStr = this.genAffiliationStr(this.form.identity_affiliation);
            this.$axios
                .post('api/identity/update', {
                    identity_id: this.form.identity_id,
                    identity_name: this.form.identity_name,
                    identity_secret: this.form.identity_secret,
                    identity_type: this.form.identity_type,
                    identity_affiliation: orgStr,
                    identity_attrs: this.form.identity_attrs,
                    identity_ip: this.form.identity_ip,
                    identity_user: this.form.identity_user,
                    identity_pw: this.form.identity_pw,
                    identity_path: this.form.identity_path,
                })
                .then(res => {
                    if (res.data.code == 0) {
                        this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                        this.getData();
                    } else {
                        this.$message.error(`修改第 ${this.idx + 1} 行失败`);
                    }
                });

            this.$set(this.tableData, this.idx, this.form);
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        },
        handleRegister(index, row) {
            this.$confirm('确定要注册 ' + row.identity_name + ' 吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$axios
                    .post('api/identity/register', {
                        id: row.identity_id,
                        name: row.identity_name,
                        secret: row.identity_secret,
                        type: row.identity_type,
                        affiliation: row.identity_affiliation,
                        attrs: row.identity_attrs,
                    })
                    .then(res => {
                        console.log(res.data);
                        if (res.data.code == 0) {
                            this.$message.success('注册 ' + row.identity_name + ' 成功');
                            this.getData();
                        } else {
                            this.$message.error('注册 ' + row.identity_name + ' 失败或已注册');
                        }
                    });
                })
                .catch(() => {}); 
        },
        handleEnroll(index, row) {
            this.$confirm('确定要登记 ' + row.identity_name + ' 吗？', '提示', {
                type: 'warning'
            })
            .then(() => {
                this.$axios
                .post('api/identity/enroll', {
                    id: row.identity_id,
                    name: row.identity_name,
                    secret: row.identity_secret,
                    attrs: row.identity_attrs,
                    type: row.identity_type,
                })
                .then(res => {
                    console.log(res.data);
                    if (res.data.code == 0) {
                        this.$message.success('登记 ' + row.identity_name + ' 成功');
                        this.getData();
                    } else {
                        this.$message.error('登记 ' + row.identity_name + ' 失败或已登记');
                    }
                });
            })
            .catch(() => {});
        },
        handleRevoke(index, row) {
            this.$confirm('确定要注销 ' + row.identity_name + ' 吗？', '提示', {
                type: 'warning'
            })
            .then(() => {
                this.$axios
                .post('api/identity/revoke', {
                    id: row.identity_id,
                    name: row.identity_name,
                    type: row.identity_type,
                })
                .then(res => {
                    console.log(res.data);
                    if (res.data.code == 0) {
                        this.$message.success('注销 ' + row.identity_name + ' 成功');
                        this.getData();
                    } else {
                        this.$message.error('注销 ' + row.identity_name + ' 失败或已注销');
                    }
                });
            })
            .catch(() => {});
        },
        handleInstall(index, row) {
            this.$confirm('确定要安装参与者 ' + row.identity_name + ' 的身份证书吗？', '提示', {
                type: 'warning'
            })
            .then(() => {
                this.$axios
                .post('api/identity/install', {
                    name: row.identity_name,
                    ip: row.identity_ip,
                    user: row.identity_user,
                    pw: row.identity_pw,
                    path: row.identity_path,
                })
                .then(res => {
                    console.log(res.data);
                    if (res.data.code == 0) {
                        this.$message.success('安装 ' + row.identity_name + ' 身份证书成功');
                    } else {
                        this.$message.error('安装 ' + row.identity_name + ' 身份证书失败');
                    }
                });
            })
            .catch(() => {});
        },
        onSubmit(formName) {
            this.$refs[formName].validate((valid) => {
            if (valid) {
                console.log("onSubmit")
                var orgStr = this.genAffiliationStr(this.form.identity_affiliation);
                this.$axios.post('api/identity/create', {
                    identity_name: this.form.identity_name,
                    identity_secret: this.form.identity_secret,
                    identity_type: this.form.identity_type,
                    identity_affiliation: orgStr,
                    identity_attrs: this.form.identity_attrs,
                    identity_ip: this.form.identity_ip,
                    identity_user: this.form.identity_user,
                    identity_pw: this.form.identity_pw,
                    identity_path: this.form.identity_path,
                })
                .then( (res) => {
                    if (res.data.code == 0) {
                        this.$message.success('提交成功');
                        this.getData();
                    } else {
                        this.$message.error('提交失败');
                    }  
                    this.addIdentityVisible = false;
                })
            } else {
                console.log('error submit!!');
                return false;
            }
            });
        },
        onClear(formName) {
            this.form = {};
            this.$refs[formName].resetFields();
        },
        // 触发组织结构编辑
        handleOrgEdit() {
            this.editOrgVisible = true;
            this.getOrgData();
        },
        // 从后台获取组织结构信息
        getOrgData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'identity_organization'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.orgObj = res.data;
                    this.orgData = JSON.parse(this.orgObj.enum_value);
                    console.log("orgData: ", this.orgData);
                    this.orgId = this.orgData[0].orgId;
                    this.orgData = this.orgData.slice(1);
                    this.orgOpts = this.orgData;
                });
        },
        // 保存组织结构
        saveOrgEdit() {
            this.editOrgVisible = false;
            var orgIdObj = {"orgId":this.orgId};
            this.orgData.unshift(orgIdObj);
            this.$axios
                .post('api/enum/putValue', {
                    enum_id: this.orgObj.enum_id,
                    enum_key: this.orgObj.enum_key,
                    enum_value: JSON.stringify(this.orgData),
                })
                .then(res => {
                    this.$message.success(`保存成功`);
                    this.getOrgData();
                });
        },
        appendOrg(data) {
            const newChild = { id: this.orgId++, label: '未命名组织', value: '未命名组织', isEdit: true,};
            if (!data.children) {
                this.$set(data, 'children', []);
            }
            data.children.push(newChild);
        },

        editOrg(node, data) {
            node.data.isEdit = true;
        },
        saveOrgNode(node) {
            node.data.value = node.data.label;
            node.data.isEdit = false;
        },
        removeOrg(node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },
        handleAddTop() {
            this.orgData.push({
            id: ++this.orgId,
            label: '一级组织',
            value: '一级组织',
            isEdit: true,
            children: []
            })
        },
        genAffiliationStr(array) {
            var orgStr = "";
            if (array.length == 1) {
                orgStr = array[0];
            } else {
                for (var i = 0; i < array.length; i++) {
                    orgStr += array[i];
                    if (i != array.length - 1) {
                        orgStr += "/";
                    }
                }
            }
            return orgStr;
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 150px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.orange {
    color:#E6A23C;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>
