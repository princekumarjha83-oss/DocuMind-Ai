"""Add selected_document_ids_json to conversations

Revision ID: 0003_conv_doc_ids
Revises: 0002_chunks_and_messages
Create Date: 2026-11-02 02:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0003_conv_doc_ids'
down_revision: Union[str, None] = '0002_chunks_and_messages'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table('conversations') as batch_op:
        batch_op.add_column(
            sa.Column('selected_document_ids_json', sa.Text(), nullable=True, server_default='[]')
        )

def downgrade() -> None:
    with op.batch_alter_table('conversations') as batch_op:
        batch_op.drop_column('selected_document_ids_json')

