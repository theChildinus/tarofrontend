<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>编辑组织结构</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <div class="block">
                        <el-tree
                            :data="data"
                            show-checkbox
                            node-key="id"
                            default-expand-all
                            :expand-on-click-node="false"
                        >
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                                <span>{{ node.label }}</span>
                                <span>
                                    <el-button
                                        type="text"
                                        size="mini"
                                        @click="() => append(data)"
                                    >Append</el-button>
                                    <el-button
                                        type="text"
                                        size="mini"
                                        @click="() => remove(node, data)"
                                    >Delete</el-button>
                                </span>
                            </span>
                        </el-tree>
                    </div>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">提交</el-button>
                        <el-button>取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
let id = 1000;

export default {
    data() {
        const data = [
            {
                id: 1,
                label: '部门1',
                children: [
                    {
                        id: 4,
                        label: '二级部门 1-1',
                        children: [
                            {
                                id: 9,
                                label: '三级部门 1-1-1'
                            },
                            {
                                id: 10,
                                label: '三级部门 1-1-2'
                            }
                        ]
                    }
                ]
            },
            {
                id: 2,
                label: '部门2',
                children: [
                    {
                        id: 5,
                        label: '二级部门 2-1'
                    },
                    {
                        id: 6,
                        label: '二级部门 2-2'
                    }
                ]
            },
            {
                id: 3,
                label: '部门3',
                children: [
                    {
                        id: 7,
                        label: '二级部门 3-1'
                    },
                    {
                        id: 8,
                        label: '二级部门 3-2'
                    }
                ]
            }
        ];
        return {
            data: JSON.parse(JSON.stringify(data)),
            data: JSON.parse(JSON.stringify(data))
        };
    },

    methods: {
        append(data) {
            const newChild = { id: id++, label: 'testtest', children: [] };
            if (!data.children) {
                this.$set(data, 'children', []);
            }
            data.children.push(newChild);
        },

        remove(node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },

        renderContent(h, { node, data, store }) {
            return (
                <span class="custom-tree-node">
                    <span>{node.label}</span>
                    <span>
                        <el-button size="mini" type="text" on-click={() => this.append(data)}>
                            Append
                        </el-button>
                        <el-button size="mini" type="text" on-click={() => this.remove(node, data)}>
                            Delete
                        </el-button>
                    </span>
                </span>
            );
        }
    }
};
</script>

<style>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>