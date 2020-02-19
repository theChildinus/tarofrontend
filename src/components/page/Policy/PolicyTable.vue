<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 资源管理和策略管理表格
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
                <el-input v-model="search.searchSub" placeholder="策略规则主体" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="clearSelection">清空</el-button>
                <el-button type="primary" icon="el-icon-edit" @click="handleEditPolicyTree">编辑策略树</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleAddPolicyRule">添加策略规则</el-button>
                <el-button type="primary" icon="el-icon-edit" @click="handleEnumEdit">编辑策略规则动作</el-button>
                <el-button type="primary" icon="el-icon-edit" @click="handleEditPolicyRes">管理策略规则资源</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                :default-sort = "{prop: 'policy_name', order: 'ascending'}"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="policy_id" label="ID" width="60" align="center" sortable></el-table-column>
                <el-table-column prop="policy_name" label="策略名称" sortable></el-table-column>
                <el-table-column prop="policy_sub" label="策略规则主体"></el-table-column>
                <el-table-column prop="policy_obj" label="策略规则资源"></el-table-column>
                <el-table-column prop="policy_act" label="策略规则动作" width="120"></el-table-column>
                <el-table-column prop="policy_type" label="主体类型" width="100"></el-table-column>
                <el-table-column prop="policy_ctime" label="添加时间"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
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

        <!-- 编辑策略规则弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="120px">
                <el-form-item label="策略名称">
                    <el-cascader v-model="form.policy_name" :options="policyTreeOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;" disabled></el-cascader>
                </el-form-item>
                <el-form-item label="主体类型">
                    <el-radio-group v-model="form.policy_type" disabled>
                        <el-radio label="物联网用户" value="物联网用户"></el-radio>
                        <el-radio label="区块链参与者" value="区块链参与者"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="策略规则主体">
                    <el-row type="flex" class="row-bg" :gutter="10">
                        <el-col v-if="form.policy_type=='物联网用户'">
                            <el-cascader v-model="form.policy_sub.department" :options="departmentOpts" 
                            :props="{ checkStrictly: true }" clearable :show-all-levels="false" placeholder="请选择部门">
                            </el-cascader>
                        </el-col>
                        <el-col v-else>
                            <el-cascader v-model="form.policy_sub.department" :options="affiliationOpts" 
                            :props="{ checkStrictly: true }" clearable :show-all-levels="false" placeholder="请选择组织">
                            </el-cascader>
                        </el-col>
                        <el-col v-if="form.policy_type=='物联网用户'">
                            <el-select v-model="form.policy_sub.role" placeholder="请选择用户或角色">
                            <el-option v-for="(item, idx) in userRoleList" :key="idx" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col v-else>
                            <el-select v-model="form.policy_sub.role" placeholder="请选择参与者">
                            <el-option v-for="(item, idx) in identityNamesList" :key="idx" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="策略规则资源">
                    <el-cascader v-model="form.policy_obj" :options="policyResourceOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="策略规则动作">
                    <el-select
                        v-model="form.policy_act"
                        placeholder="动作类型"
                        class="handle-select mr10"
                    >
                        <el-option v-for="item in enumValueList" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑策略规则动作弹出框 -->
        <el-dialog title="编辑策略动作（以 ## 分隔）" :visible.sync="editEnumVisible" width="30%">
            <el-input type="textarea" autosize placeholder="请输入内容" v-model="enumObj.enum_value"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editEnumVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEnumEdit">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 添加策略规则弹出框 -->
        <el-dialog title="添加策略规则" :visible.sync="addPolicyRuleVisible" width="30%">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="策略名称" prop="policy_name">
                    <el-cascader v-model="form.policy_name" :options="policyTreeOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="主体类型" prop="policy_type">
                    <el-radio-group v-model="form.policy_type">
                        <el-radio label="物联网用户" value="物联网用户"></el-radio>
                        <el-radio label="区块链参与者" value="区块链参与者"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="策略规则主体" prop="policy_sub">
                    <el-row type="flex" class="row-bg" :gutter="10">
                        <el-col v-if="form.policy_type=='物联网用户'">
                            <el-cascader v-model="form.policy_sub.department" :options="departmentOpts" 
                            :props="{ checkStrictly: true }" clearable :show-all-levels="false" placeholder="请选择部门">
                            </el-cascader>
                        </el-col>
                        <el-col v-else>
                            <el-cascader v-model="form.policy_sub.department" :options="affiliationOpts" 
                            :props="{ checkStrictly: true }" clearable :show-all-levels="false" placeholder="请选择组织">
                            </el-cascader>
                        </el-col>
                        <el-col v-if="form.policy_type=='物联网用户'">
                            <el-select v-model="form.policy_sub.role" placeholder="请选择用户或角色">
                            <el-option v-for="(item, idx) in userRoleList" :key="idx" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col v-else>
                            <el-select v-model="form.policy_sub.role" placeholder="请选择参与者">
                            <el-option v-for="(item, idx) in identityNamesList" :key="idx" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="策略规则资源" prop="policy_obj">
                    <el-cascader v-model="form.policy_obj" :options="policyResourceOpts" 
                    :props="{ checkStrictly: true }" clearable style="width: 100%;"></el-cascader>
                </el-form-item>
                <el-form-item label="策略规则动作" prop="policy_act">
                    <el-select v-model="form.policy_act" placeholder="请选择">
                    <el-option v-for="item in enumValueList" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit('form')">表单提交</el-button>
                    <el-button type="danger" @click="onClear('form')">清空</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 编辑策略树弹出框 -->
        <el-dialog title="编辑策略树" :visible.sync="editPolicyTreeVisible" width="30%">
            <el-tree :data="policyTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span v-if="node.data.isEdit==true">
                        <el-input size="mini" v-model="node.data.label" @blur="saveNode(node)"></el-input>
                    </span>
                    <span v-else>{{ node.data.label }}</span>
                    <span>
                        <el-button type="text" size="mini" icon="el-icon-plus" @click="appendNode(data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-edit" @click="editNode(node, data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-delete" @click="removeNode(node, data)"></el-button>
                    </span>
                </span>
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleModel">设置访问控制模型</el-button>
                <el-button type="primary" @click="handleAddTop">添加根节点</el-button>
                <el-button @click="editPolicyTreeVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePolicyTree">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 管理策略规则资源弹出框 -->
        <el-dialog title="管理策略规则资源" :visible.sync="editPolicyResVisible" width="30%">
            <el-tree :data="policyResourceData" node-key="id" :default-expand-all="false" :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span v-if="node.data.isEdit==true">
                        <el-input size="mini" v-model="node.data.label" @blur="saveResNode(node)"></el-input>
                    </span>
                    <span v-else>{{ node.data.label }}</span>
                    <span>
                        <el-button type="text" size="mini" icon="el-icon-plus" @click="appendResNode(data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-edit" @click="editResNode(node, data)"></el-button>
                        <el-button type="text" size="mini" icon="el-icon-delete" @click="removeResNode(node, data)"></el-button>
                    </span>
                </span>
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleAddTopRes">添加根节点</el-button>
                <el-button @click="editPolicyResVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePolicyRes">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 访问控制模型弹出框 -->
        <el-dialog title="设置访问控制模型" :visible.sync="editModelVisible" width="30%">
            <div v-for="(item, index) in modelDataList" :key="index" :label="item" :value="item">
                <el-row type="flex" class="row-bg">
                <el-col><div>{{item.policy_name}}</div></el-col>
                <el-col><el-radio-group v-model="item.model_type">
                        <el-radio label="ACL"></el-radio>
                        <el-radio label="RBAC"></el-radio>
                    </el-radio-group></el-col>
                </el-row>
            </div>    
            <span slot="footer" class="dialog-footer">
                <el-button @click="editModelVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePolicyModel">保 存</el-button>
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
            departmentOpts: [],
            userRoleList: [],
            affiliationOpts: [],
            identityNamesList: [],
            addPolicyRuleVisible: false,
            editPolicyTreeVisible: false,
            editEnumVisible: false,
            editModelVisible: false,
            modelDataList: [],
            modelObj: {},
            policyTreeId: -1,
            policyTreeObj: [],
            policyTreeData: [],
            policyTreeOpts: [],
            pageTotal: 0,
            form: {
                policy_sub: {
                    department:[],
                    role:"",
                },
            },
            editPolicyResVisible: false,
            policyResourceId: -1,
            policyResourceObj: [],
            policyResourceData: [],
            policyResourceOpts: [],
            idx: -1,
            id: -1,
            rules: {
                policy_name: [
                    { required: true, message: '请选择策略名称', trigger: 'change' },
                ],
                policy_type: [
                    { required: true, message: '请选择策略主体类型', trigger: 'change' },
                ],
                policy_sub: [{   
                    type: 'object', required: true, trigger: 'change',
                    fields: {
                        department: {type: 'array', required: true, message: '请选择组织', trigger: 'blur'},
                        role: {required: true, message: '请选择用户或角色', trigger: 'blur'}
                    }
                }],
                policy_obj: [
                    { required: true, message: '请选择策略规则资源', trigger: 'change' },
                ],
                policy_act: [
                    { required: true, message: '请选择策略规则动作', trigger: 'change' },
                ],
            }
        };
    },
    created() {
        this.getData();
        this.getEnumData();
        this.getDepartmentAndRoleData();
        this.getOrgAndIdentityData();
        this.getPolicyTreeData();
        this.getModelData();
        this.getPolicyRes();
    },
    methods: {
        /*#################################### 获取策略规则数据 ####################################*/
        // 获取 easy-mock 的模拟数据
        getData() {
            // fetchData(this.query).then(res => {
            //     this.tableData = res.list;
            //     this.pageTotal = res.pageTotal || 50;
            // });
            this.$axios
                .post('api/policy/list', {
                    page_index: this.query.pageIndex,
                    page_size: this.query.pageSize,
                    search_sub: this.search.searchSub == null ? '' : this.search.searchSub
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
                        .post('api/policy/deleteOne', {
                            policy_id: row.policy_id
                        })
                        .then(res => {
                            this.$message.success('删除成功');
                            this.getData();
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
        /*#################################### 编辑并保存策略规则 ####################################*/
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            var data = row;
            var pnArr = data.policy_name.split("#");
            var psArr = data.policy_sub.split("/");
            var poArr = data.policy_obj.split("/");
            this.$set(this.form, 'policy_name', pnArr);
            this.$set(this.form, 'policy_obj', poArr);
            this.$set(this.form, 'policy_sub', {});
            this.$set(this.form.policy_sub, 'role', psArr[psArr.length - 1]);
            psArr.pop();
            this.$set(this.form.policy_sub, 'department', psArr);
            this.$set(this.form, 'policy_act', data.policy_act);
            this.$set(this.form, 'policy_id', data.policy_id);
            this.$set(this.form, 'policy_type', data.policy_type);
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            var policyNameStr = this.getPolicyNameStr();
            var policySubStr = this.getPolicySubStr();
            var policyObjStr = this.getPolicyObjStr();
            this.$axios
                .post('api/policy/update', {
                    policy_id: this.form.policy_id,
                    policy_name: policyNameStr,
                    policy_sub: policySubStr,
                    policy_obj: policyObjStr,
                    policy_act: this.form.policy_act,
                    policy_type: this.form.policy_type,
                })
                .then(res => {
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    this.handleRefresh();
                });
            this.$set(this.tableData, this.idx, this.form);
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        },
        /*#################################### 策略规则动作 ####################################*/
        // 获取策略动作数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'policy_act'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.enumObj = res.data;
                    this.parseEnumData(this.enumObj.enum_value);
                });
        },
        // 触发策略动作编辑
        handleEnumEdit() {
            this.editEnumVisible = true;
        },
        // 保存策略动作编辑
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
        // 处理策略动作数据
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
        /*#################################### 添加及提交策略规则 ####################################*/
        // 触发添加策略规则
        handleAddPolicyRule() {
            this.form = {
                policy_sub: {
                    department:[],
                    role:"",
                },
            };
            this.addPolicyRuleVisible = true;
        },
        // 提交添加策略规则
        onSubmit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                console.log('submit');
                var policyNameStr = this.getPolicyNameStr();
                var policySubStr = this.getPolicySubStr();
                var policyObjStr = this.getPolicyObjStr();
                this.$axios.post('api/policy/create', {
                    policy_name: policyNameStr,
                    policy_sub: policySubStr,
                    policy_obj: policyObjStr,
                    policy_act: this.form.policy_act,
                    policy_type: this.form.policy_type,
                })
                .then( (res) => {
                    this.addPolicyRuleVisible = false;
                    if (res.data.code == 0) {
                        this.$message.success('提交成功！'); 
                    } else {
                        this.$message.error('提交失败，策略可能已存在！'); 
                    }   
                })
                } else {
                    console.log('error submit!!');
                    return false
                }
            });
        },
        onClear(formName) {
            this.form = {
                policy_sub: {
                    department:[],
                    role:"",
                },
            };
            this.$refs[formName].resetFields();
        },
        /*#################################### 策略规则主体 ####################################*/
        // 获取所有用户名和角色
        getDepartmentAndRoleData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'user_organization'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    var departmentData = JSON.parse(res.data.enum_value);
                    this.departmentOpts = departmentData.slice(1);
                });
            this.$axios
                .post('api/user/listNameAndRole', {
                    enum_key: 'user_role'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.userRoleList = res.data.list;
                });    
        },
        getOrgAndIdentityData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'identity_organization'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    var data = JSON.parse(res.data.enum_value);
                    this.affiliationOpts = data.slice(1);
                });
            this.$axios
                .post('api/identity/listNames', {
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.identityNamesList = res.data.list;
                });
        },
        /*#################################### 策略规则资源 ####################################*/
        // 触发管理策略规则资源
        handleEditPolicyRes() {
            this.editPolicyResVisible = true;
            this.getPolicyRes();
        },
        // 获取策略规则资源
        getPolicyRes() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'policy_resource'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.policyResourceObj = res.data;
                    this.policyResourceData = JSON.parse(this.policyResourceObj.enum_value);
                    //console.log("policyResourceData: ", this.policyResourceData);
                    this.policyResourceId = this.policyResourceData[0].policyResourceId;
                    this.policyResourceData = this.policyResourceData.slice(1);
                    this.policyResourceOpts = this.policyResourceData;
                });
        },
        // 保存策略规则资源
        savePolicyRes() {
            this.editPolicyResVisible = false;
            var IdObj = {"policyResourceId":this.policyResourceId};
            this.policyResourceData.unshift(IdObj);
            this.$axios
                .post('api/enum/putValue', {
                    enum_id: this.policyResourceObj.enum_id,
                    enum_key: this.policyResourceObj.enum_key,
                    enum_value: JSON.stringify(this.policyResourceData),
                })
                .then(res => {
                    this.getPolicyRes();
                    this.$message.success(`保存成功`);
                });
        },
        appendResNode(data) {
            const newChild = { id: this.policyTreeId++, label: '未命名资源', value: '未命名资源', isEdit: true,};
            if (!data.children) {
                this.$set(data, 'children', []);
            }
            data.children.push(newChild);
        },

        editResNode(node, data) {
            node.data.isEdit = true;
        },
        saveResNode(node) {
            node.data.value = node.data.label;
            node.data.isEdit = false;
        },
        removeResNode(node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },
        handleAddTopRes() {
            this.policyResourceData.push({
            id: ++this.policyResourceId,
            label: '资源',
            value: '资源',
            isEdit: true,
            children: []
            });
        },
        /*#################################### 策略树 ####################################*/
        // 触发策略树编辑
        handleEditPolicyTree() {
            this.editPolicyTreeVisible = true;
            this.getPolicyTreeData();
        },
        // 从后台获取策略树信息
        getPolicyTreeData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'policy_tree'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.policyTreeObj = res.data;
                    this.policyTreeData = JSON.parse(this.policyTreeObj.enum_value);
                    //console.log("policyTreeData: ", this.policyTreeData);
                    this.policyTreeId = this.policyTreeData[0].policyTreeId;
                    this.policyTreeData = this.policyTreeData.slice(1);
                    this.policyTreeOpts = this.policyTreeData;
                });
        },
        // 保存策略树
        savePolicyTree() {
            this.editPolicyTreeVisible = false;
            var IdObj = {"policyTreeId":this.policyTreeId};
            this.policyTreeData.unshift(IdObj);
            this.$axios
                .post('api/enum/putValue', {
                    enum_id: this.policyTreeObj.enum_id,
                    enum_key: this.policyTreeObj.enum_key,
                    enum_value: JSON.stringify(this.policyTreeData),
                })
                .then(res => {
                    this.getPolicyTreeData();
                    this.$message.success(`保存成功`);
                });
        },
        appendNode(data) {
            const newChild = { id: this.policyTreeId++, label: '未命名策略', value: '未命名策略', isEdit: true,};
            if (!data.children) {
                this.$set(data, 'children', []);
            }
            data.children.push(newChild);
        },

        editNode(node, data) {
            node.data.isEdit = true;
        },
        saveNode(node) {
            node.data.value = node.data.label;
            node.data.isEdit = false;
        },
        removeNode(node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },
        handleAddTop() {
            this.policyTreeData.push({
            id: ++this.policyTreeId,
            label: '父策略',
            value: '父策略',
            isEdit: true,
            children: []
            });
        },
        /*#################################### 访问控制模型 ####################################*/
        handleModel() {
            this.editModelVisible = true;
            this.getModelData();
        },
        getModelData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'policy_model'
                })
                .then(res => {
                    //console.log('resdata: ', res.data);
                    this.modelObj = res.data;
                    this.modelDataList = JSON.parse(res.data.enum_value);
                    // 同步策略树中的根节点策略信息与设置访问控制模型中的策略信息
                    var newModelDataList = new Array();
                    var arrayMods = this.modelDataList;
                    var arrayOpts = this.policyTreeOpts;
                    arrayMods.push(arrayMods[0])
                    for (var i = 0; i < arrayOpts.length; i++) {
                        var label = arrayOpts[i].label;
                        var j = 1;
                        for (j = 1; j < arrayMods.length; j++) {
                            if (label == arrayMods[j].policy_name) {
                                newModelDataList.push({policy_name:label, model_type: arrayMods[j].model_type})
                                break;
                            }
                        }
                        if (j == arrayMods.length) {
                            newModelDataList.push({policy_name:label, model_type: "ACL"})
                        }
                    }
                    this.modelDataList = newModelDataList;
                });
        },
        savePolicyModel() {
            this.editModelVisible = false;
            this.$axios
                .post('api/enum/putValue', {
                    enum_id: this.modelObj.enum_id,
                    enum_key: this.modelObj.enum_key,
                    enum_value: JSON.stringify(this.modelDataList),
                })
                .then(res => {
                    this.parseEnumData(this.enumObj.enum_value);
                    this.$message.success(`保存成功`);
                });
        },

        /*#################################### 通用函数 ####################################*/
        getPolicyNameStr() {
            var array = this.form.policy_name;
            var policyNameStr = "";
            for (var i = 0; i < array.length; i++) {
                policyNameStr += array[i];
                if (i != array.length - 1) {
                    policyNameStr += "#";
                }
            }
            return policyNameStr;
        },
        getPolicySubStr() {
            var array = [];
            array = this.form.policy_sub.department;
            var policySubStr = "";
            if (array != undefined && array.length >= 1) {
                for (var i = 0; i < array.length; i++) {
                    policySubStr += array[i];
                    if (i != array.length - 1) {
                        policySubStr += "/";
                    }
                }
                policySubStr = policySubStr + "/" + this.form.policy_sub.role;
            } else {
                policySubStr = this.form.policy_sub.role
            }
            return policySubStr;
        },
        getPolicyObjStr() {
            var array = this.form.policy_obj;
            var policyObjStr = "";
            for (var i = 0; i < array.length; i++) {
                policyObjStr += array[i];
                if (i != array.length - 1) {
                    policyObjStr += "/";
                }
            }
            return policyObjStr;
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
