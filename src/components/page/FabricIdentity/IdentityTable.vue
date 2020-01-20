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
                <!-- <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button> -->
                <el-row>
                    <el-col :span='16'>
                        <el-select
                            v-model="search.searchType"
                            placeholder="身份类型"
                            class="handle-select mr10"
                        >
                            <el-option v-for="item in identityTypeList" :key="item" :label="item" :value="item"></el-option>
                        </el-select>
                        <el-input v-model="search.searchName" placeholder="身份名称" class="handle-input mr10"></el-input>
                        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                        <el-button type="primary" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
                        <el-button type="danger"  icon="el-icon-delete" @click="clearSelection">清空</el-button>
                        <el-button type="primary" icon="el-icon-plus" @click="handleAddIdentity">添加参与者</el-button>
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
                <el-table-column prop="identity_name" label="参与者名" width="150"></el-table-column>
                <el-table-column prop="identity_type" label="参与者类型" width="100"></el-table-column>
                <el-table-column prop="identity_affiliation" label="参与者从属" width="100"></el-table-column>
                <el-table-column prop="identity_attrs" label="参与者属性"></el-table-column>
                <el-table-column prop="identity_ip" label="参与者证书存储地址"></el-table-column>
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
                            @click="handleEnroll(scope.$index, scope.row)"
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
                <el-form-item label="身份名称">
                    <el-input v-model="form.identity_name"></el-input>
                </el-form-item>
                <el-form-item label="身份密码">
                    <el-input v-model="form.identity_secret"></el-input>
                </el-form-item>
                <el-form-item label="身份类型"> 
                    <el-radio disabled v-model="form.identity_type" label="client">client</el-radio>
                    <el-radio disabled v-model="form.identity_type" label="peer">peer</el-radio>
                    <el-radio disabled v-model="form.identity_type" label="order">order</el-radio>
                </el-form-item>
                <el-form-item label="身份从属">
                    <el-input v-model="form.identity_affiliation"></el-input>
                </el-form-item>
                <el-form-item label="身份属性">
                    <el-input v-model="form.identity_attrs"></el-input>
                </el-form-item>
                <el-form-item label="证书存储地址">
                    <el-input v-model="form.identity_ip"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加参与者身份信息弹出框 -->
        <el-dialog title="添加参与者身份信息" :visible.sync="addIdentityVisible" width="30%">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="身份名称">
                <el-input v-model="form.identity_name"></el-input>
                </el-form-item>
                <el-form-item label="身份密码">
                    <el-input v-model="form.identity_secret"></el-input>
                </el-form-item>
                <el-form-item label="身份类型"> 
                    <el-radio-group v-model="form.identity_type">
                        <el-radio label="client"></el-radio>
                        <el-radio label="peer"></el-radio>
                        <el-radio label="order"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="身份从属">
                    <el-input v-model="form.identity_affiliation"></el-input>
                </el-form-item>
                <el-form-item label="身份属性">
                    <el-input v-model="form.identity_attrs"></el-input>
                </el-form-item>
                <el-form-item label="证书存储地址">
                    <el-input v-model="form.identity_ip"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">表单提交</el-button>
                    <el-button type="danger" @click="onClear">清空</el-button>
                </el-form-item>
            </el-form>
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
            form: {},
            idx: -1,
            id: -1
        };
    },
    created() {
        this.getData();
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
                    this.$axios
                        .post('api/identity/deleteOne', {
                            identity_id: row.identity_id
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
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
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
            this.form = row;
            this.editVisible = true;
        },
        handleAddIdentity() {
            this.addIdentityVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            this.$axios
                .post('api/identity/update', {
                    identity_id: this.form.identity_id,
                    identity_name: this.form.identity_name,
                    identity_secret: this.form.identity_secret,
                    identity_type: this.form.identity_type,
                    identity_affiliation: this.form.identity_affiliation,
                    identity_attrs: this.form.identity_attrs,
                    identity_ip: this.form.identity_ip,
                })
                .then(res => {
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
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
                            this.$message.success('注册 ' + row.identity_name + ' 成功，请刷新页面');
                        } else {
                            this.$message.error('注册 ' + row.identity_name + ' 失败或已注册');
                        }
                    });
                })
                .catch(() => {}); 
        },
        handleEnroll(index, row) {
            this.$confirm('确定要登录 ' + row.identity_name + ' 吗？', '提示', {
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
                        this.$message.success('登录 ' + row.identity_name + ' 成功，请刷新页面');
                    } else {
                        this.$message.error('登录 ' + row.identity_name + ' 失败或已登录');
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
                        this.$message.success('注销 ' + row.identity_name + ' 成功，请刷新页面');
                    } else {
                        this.$message.error('注销 ' + row.identity_name + ' 失败或已注销');
                    }
                });
            })
            .catch(() => {});
        },
        onSubmit() {
            console.log("onSubmit")
            this.$axios.post('api/identity/create', {
                identity_name: this.form.identity_name,
                identity_secret: this.form.identity_secret,
                identity_type: this.form.identity_type,
                identity_affiliation: this.form.identity_affiliation,
                identity_attrs: this.form.identity_attrs,
                identity_ip: this.form.identity_ip,
            })
            .then( (res) => {
                this.$message.success('提交成功！');
                this.addIdentityVisible = false;
            })
        },
        onClear() {
            this.form = {};
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
</style>
