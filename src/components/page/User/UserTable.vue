<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 基础表格
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!-- <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button> -->
                <el-row>
                    <el-col :span='13'>
                        <el-input v-model="search.searchName" placeholder="用户名" class="handle-input mr10"></el-input>
                        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                        <el-button type="primary" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="clearSelection">清空</el-button>
                        <el-button type="primary" icon="el-icon-edit" @click="handleEnumEdit">编辑用户角色</el-button>
                        <el-button type="primary" icon="el-icon-edit" @click="handleOrgEdit">编辑组织结构</el-button>
                    </el-col>
                    <el-col :span='6' :offset='5'>
                        <el-alert title="请保证用户名唯一，重名用户可添加数字进行区分" type="info" :closable="false" center show-icon></el-alert>
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
                <el-table-column prop="user_id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="user_name" label="用户名"></el-table-column>
                <el-table-column prop="user_role" label="用户角色"></el-table-column>
                <el-table-column prop="user_department" label="部门"></el-table-column>
                <el-table-column prop="user_address" label="地址"></el-table-column>
                <el-table-column prop="user_email" label="电子邮箱"></el-table-column>
                <el-table-column prop="user_phone" label="联系方式"></el-table-column>
                <el-table-column label="证书状态" align="center">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.user_status===1?'success':(scope.row.user_status===0?'danger':'')"
                        >{{scope.row.user_status == 1? "已创建":"未创建"}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-postcard"
                            class="orange"
                            @click="handleRegister(scope.$index, scope.row)"
                        >创建证书</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-download"
                            @click="handleDownload(scope.$index, scope.row)"
                        >下载证书</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-folder-delete"
                            class="red"
                            @click="handleRevoke(scope.$index, scope.row)"
                        >注销证书</el-button>
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
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="form.user_name"></el-input>
                </el-form-item>
                <el-form-item label="角色">
                    <el-select
                        v-model="form.user_role"
                        placeholder="用户角色"
                        class="handle-select mr10"
                    >
                        <el-option v-for="item in enumValueList" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item label="部门">
                        <el-cascader v-model="form.user_department" :options="orgOpts" 
                        :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                    </el-form-item>
                    <el-form-item label="地址">
                        <el-input v-model="form.user_address"></el-input>
                    </el-form-item>
                    <el-form-item label="电子邮箱">
                        <el-input v-model="form.user_email"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话">
                        <el-input v-model="form.user_phone"></el-input>
                    </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑用户角色弹出框 -->
        <el-dialog title="编辑用户角色（以 ## 分隔）" :visible.sync="editEnumVisible" width="30%">
            <el-input type="textarea" autosize placeholder="请输入内容" v-model="enumObj.enum_value"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editEnumVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEnumEdit">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 编辑组织结构弹出框 -->
        <el-dialog title="编辑组织结构" :visible.sync="editOrgVisible" width="30%">
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
            editVisible: false,
            enumObj: {},
            enumValueList: [],
            editEnumVisible: false,
            editOrgVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            orgId: -1,
            orgObj: {},
            orgData: [],
            orgOpts: [],
        };
    },
    created() {
        this.getData();
        this.getEnumData();
        this.getOrgData();
    },
    methods: {
        // 获取 easy-mock 的模拟数据
        getData() {
            // fetchData(this.query).then(res => {
            //     this.tableData = res.list;
            //     this.pageTotal = res.pageTotal || 50;
            // });
            this.$axios
                .post('api/user/list', {
                    page_index: this.query.pageIndex,
                    page_size: this.query.pageSize,
                    search_name: this.search.searchName == null ? '' : this.search.searchName
                })
                .then(res => {
                    console.log(res.data);
                    this.tableData = res.data.list;
                    this.pageTotal = res.data.count || 50;
                });
        },
        handleRefresh() {
            this.getData();
        },
        clearSelection() {
            this.search = {};
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
                    this.$axios
                        .post('api/user/deleteOne', {
                            user_id: row.user_id,
                            user_name: row.user_name,
                            user_role: row.user_role,
                        })
                        .then(res => {
                            if (res.data.code == 0) {
                                this.$message.success('删除成功');
                            } else {
                                this.$message.success('删除失败');
                            }
                        });
                })
                .catch(() => {});
        },
        handleDownload(index, row) {
            this.$axios({
                method: 'post',
                url: 'api/user/downloadCert',
                data: {
                    userid: row.user_id,
                    username: row.user_name
                },
            })
            .then(res => {
                if (res.data.cert != '' && res.data.cert != undefined) {
                    console.log("download userid: " + row.user_id);
                    const content = res.data.cert;
                    const blob = new Blob([content]);
                    const fileName =  row.user_name + ".crt";
                    if ("download" in document.createElement("a")) {
                        // 非IE下载
                        const elink = document.createElement("a");
                        elink.download = fileName;
                        elink.style.display = "none";
                        elink.href = URL.createObjectURL(blob);
                        document.body.appendChild(elink);
                        elink.click();
                        URL.revokeObjectURL(elink.href); // 释放URL 对象
                        document.body.removeChild(elink);
                    } else {
                        // IE10+下载
                        navigator.msSaveBlob(blob, fileName);
                    }
                    this.$message.success(`下载成功`);
                } else {
                    this.$message.error("下载失败");
                }
            })
            .catch(() => {
                this.$message.error("下载失败");
            });
        },
        handleRevoke(index, row) {
            this.$confirm('确定要注销吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$axios
                    .post('api/user/revoke', {
                        userid: row.user_id,
                        username: row.user_name,
                    })
                    .then(res => {
                        console.log(res.data);
                        if (res.data.code == 0) {
                            this.$message.success(`注销成功，请刷新页面`);
                        } else {
                            this.$message.error(`注销失败`);
                        }
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
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            var departmentStr = "";
            var array = this.form.user_department;
            for (var i = 0; i < array.length; i++) {
                departmentStr += array[i];
                if (i != array.length - 1) {
                    departmentStr += "/";
                }
            }
            this.form.user_department = departmentStr;
            this.$axios
                .post('api/user/update', {
                    user_id: this.form.user_id,
                    user_name: this.form.user_name,
                    user_role: this.form.user_role,
                    user_department: this.form.user_department,
                    user_address: this.form.user_address,
                    user_email: this.form.user_email,
                    user_phone: this.form.user_phone
                })
                .then(res => {
                    if (res.data.code == 0) {
                        this.$message.success(`修改第 ${this.idx + 1} 行成功`);
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
            this.$confirm('确定要创建吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$axios
                    .post('api/user/register', {
                        userid: row.user_id,
                        username: row.user_name,
                    })
                    .then(res => {
                        console.log(res.data);
                        if (res.data.code == 0) {
                            this.$message.success(`创建成功，请刷新页面`);
                        } else {
                            this.$message.error(`创建失败`);
                        }
                    });
                })
                .catch(() => {});        
        },
        // 获取用户角色数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'user_role'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.enumObj = res.data;
                    this.parseEnumData(this.enumObj.enum_value);
                });
        },
        // 触发用户角色编辑
        handleEnumEdit() {
            this.editEnumVisible = true;
        },
        // 保存用户角色编辑
        saveEnumEdit() {
            this.editEnumVisible = false;
            this.$axios
                .post('api/enum/putValue', {
                    enum_id: this.enumObj.enum_id,
                    enum_key: this.enumObj.enum_key,
                    enum_value: this.enumObj.enum_value
                })
                .then(res => {
                    this.parseEnumData(this.enumObj.enum_value);
                    this.$message.success(`保存成功`);
                });
        },
        // 处理用户角色数据
        parseEnumData(data) {
            var str = data.split('##');
            for (var i = 0; i < str.length; i++) {
                if (str[i] == '' || typeof str[i] == 'undefined') {
                    str.splice(i, 1);
                    i = i - 1;
                }
            }
            this.enumValueList = str;
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
                    enum_key: 'user_organization'
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
                });
        },
        appendOrg(data) {
            const newChild = { id: this.orgId++, label: '未命名部门', value: '未命名部门', isEdit: true,};
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
            label: '顶级部门',
            value: '顶级部门',
            isEdit: true,
            children: []
            })
        },
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
    width: 300px;
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
